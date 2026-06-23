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
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata.constants';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

type SearchFieldMetadataBackfillOperationsArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  // Deterministic standard-object search set (SEARCH_FIELDS_FOR_*), avoiding any
  // searchVector expression parsing.
  standardFlatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
};

// Groups rows by application so each group runs through the migration runner under
// the matching application (the runner assigns applicationId from that single app).
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
  // Dedupe (object, field) within a run: standard and custom derivations can overlap.
  const candidateSearchFieldMetadataKeys = new Set<string>();

  const pushCandidateIfMissing = ({
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
    position,
  }: {
    objectMetadataUniversalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
    position: number;
  }): void => {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        objectMetadataUniversalIdentifier
      ];
    const flatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        fieldMetadataUniversalIdentifier
      ];

    // Skip rows whose object/field isn't provisioned in this workspace yet (keeps
    // the backfill idempotent and lets each sync own its own rows).
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
        position,
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
      position: standardSearchFieldMetadata.position,
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

  // Custom objects index only the field named 'name' (SEARCH_FIELDS_FOR_CUSTOM_OBJECT).
  // Resolve it by exact name, not the label identifier: junction objects (skipNameField)
  // have no name field and must stay unsearchable — their label identifier is the UUID id.
  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (!flatObjectMetadata.isSearchable) {
      continue;
    }

    if (
      standardObjectUniversalIdentifiers.has(
        flatObjectMetadata.universalIdentifier,
      )
    ) {
      continue;
    }

    const nameFieldMetadata = flatObjectMetadata.fieldUniversalIdentifiers
      .map(
        (fieldUniversalIdentifier) =>
          flatFieldMetadataMaps.byUniversalIdentifier[
            fieldUniversalIdentifier
          ],
      )
      .find(
        (flatFieldMetadata) =>
          isDefined(flatFieldMetadata) &&
          flatFieldMetadata.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
      );

    // Aligns with the recompute, which drops non-searchable-type fields.
    if (
      !isDefined(nameFieldMetadata) ||
      !isSearchableFieldType(nameFieldMetadata.type)
    ) {
      continue;
    }

    pushCandidateIfMissing({
      objectMetadataUniversalIdentifier:
        flatObjectMetadata.universalIdentifier,
      fieldMetadataUniversalIdentifier: nameFieldMetadata.universalIdentifier,
      position: 0,
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
