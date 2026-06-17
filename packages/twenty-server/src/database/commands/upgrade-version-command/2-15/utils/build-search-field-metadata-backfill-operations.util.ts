import {
  fromArrayToValuesByKeyRecord,
  isDefined,
  isSearchableFieldType,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export type SearchFieldMetadataBackfillOperationsArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  // searchFieldMetadata maps freshly built from the twenty-standard application
  // definition for this workspace (SEARCH_FIELDS_FOR_* via the standard builders).
  // This is the deterministic source of truth for standard objects' search field
  // set — no asExpression parsing.
  standardFlatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
};

// Groups searchFieldMetadata rows to create by their object's application so each
// group is run through the migration runner with the matching application
// universalIdentifier (the runner assigns applicationId from that single app).
export const buildSearchFieldMetadataBackfillOperations = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
  standardFlatSearchFieldMetadataMaps,
}: SearchFieldMetadataBackfillOperationsArgs): {
  flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier: Record<
    string,
    UniversalFlatSearchFieldMetadata[]
  >;
} => {
  const existingSearchFieldMetadataKeys = new Set(
    Object.values(flatSearchFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map(
        (searchFieldMetadata) =>
          `${searchFieldMetadata.objectMetadataId}:${searchFieldMetadata.fieldMetadataId}`,
      ),
  );

  const flatSearchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[] =
    [];
  // Avoids emitting the same (object, field) row twice within a single run when
  // both the standard and custom derivation would target it.
  const candidateSearchFieldMetadataKeys = new Set<string>();

  const pushCandidateIfMissing = ({
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  }: {
    objectMetadataUniversalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
  }): void => {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        objectMetadataUniversalIdentifier
      ];
    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        fieldMetadataUniversalIdentifier
      ];

    // The object or field does not exist in this workspace yet (e.g. a standard
    // object a separate sync has not provisioned). Creating its searchFieldMetadata
    // is that sync's responsibility, so skip here.
    if (!isDefined(flatObjectMetadata) || !isDefined(flatFieldMetadata)) {
      return;
    }

    const searchFieldMetadataKey = `${flatObjectMetadata.id}:${flatFieldMetadata.id}`;

    if (
      existingSearchFieldMetadataKeys.has(searchFieldMetadataKey) ||
      candidateSearchFieldMetadataKeys.has(searchFieldMetadataKey)
    ) {
      return;
    }

    candidateSearchFieldMetadataKeys.add(searchFieldMetadataKey);

    flatSearchFieldMetadatasToCreate.push(
      buildFlatSearchFieldMetadataForField({
        flatObjectMetadata,
        flatFieldMetadata,
      }),
    );
  };

  // Standard objects: mirror exactly what provisioning/standard-sync creates.
  for (const standardSearchFieldMetadata of Object.values(
    standardFlatSearchFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    pushCandidateIfMissing({
      objectMetadataUniversalIdentifier:
        standardSearchFieldMetadata.objectMetadataUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        standardSearchFieldMetadata.fieldMetadataUniversalIdentifier,
    });
  }

  const standardObjectUniversalIdentifiers = new Set(
    Object.values(standardFlatSearchFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map(
        (standardSearchFieldMetadata) =>
          standardSearchFieldMetadata.objectMetadataUniversalIdentifier,
      ),
  );

  // Custom objects: the search field set is exactly the current label-identifier
  // field (mirrors buildDefaultSearchFieldMetadatasForCustomObject, whose name
  // field is the custom object's label identifier). Matched by id, never by name,
  // so a field whose name is a prefix of another's can never mis-bind.
  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (!flatObjectMetadata.isSearchable) {
      continue;
    }

    // Skip objects already covered by the standard derivation above.
    if (
      standardObjectUniversalIdentifiers.has(
        flatObjectMetadata.universalIdentifier,
      )
    ) {
      continue;
    }

    const labelIdentifierFieldMetadataId =
      flatObjectMetadata.labelIdentifierFieldMetadataId;

    if (!isDefined(labelIdentifierFieldMetadataId)) {
      continue;
    }

    const labelIdentifierFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        flatFieldMetadataMaps.universalIdentifierById[
          labelIdentifierFieldMetadataId
        ] ?? ''
      ];

    // Mirror provisioning, which only includes searchable-type fields in the
    // searchVector: a non-searchable label identifier (e.g. a relation) would be
    // filtered out of the recomputed expression, so it gets no row.
    if (
      !isDefined(labelIdentifierFieldMetadata) ||
      !isSearchableFieldType(labelIdentifierFieldMetadata.type)
    ) {
      continue;
    }

    pushCandidateIfMissing({
      objectMetadataUniversalIdentifier:
        flatObjectMetadata.universalIdentifier,
      fieldMetadataUniversalIdentifier:
        labelIdentifierFieldMetadata.universalIdentifier,
    });
  }

  const flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier =
    fromArrayToValuesByKeyRecord({
      array: flatSearchFieldMetadatasToCreate,
      key: 'applicationUniversalIdentifier',
    });

  return {
    flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
  };
};
