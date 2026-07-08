import { getFieldUniversalIdentifier } from 'twenty-shared/application';
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
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

type BuildSearchFieldMetadataBackfillOperationsArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  applicationUniversalIdentifierById: Map<string, string>;
  twentyStandardApplicationId: string;
  workspaceCustomApplicationId: string;
};

// Backfill skips the twenty-standard and workspace-custom applications (their row is
// already provisioned by the manifest funnel) and targets every other (installed)
// application's searchable objects that have no row yet. The creation rule mirrors the
// object-create side effect handler (label-identifier field of a searchable type;
// junction/id-label objects have no search surface). Grouped by application universal
// identifier for the per-application migration run.
export const buildSearchFieldMetadataBackfillOperations = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
  applicationUniversalIdentifierById,
  twentyStandardApplicationId,
  workspaceCustomApplicationId,
}: BuildSearchFieldMetadataBackfillOperationsArgs): Record<
  string,
  UniversalFlatSearchFieldMetadata[]
> => {
  const existingSearchFieldMetadataKeys = new Set<string>();

  for (const flatSearchFieldMetadata of Object.values(
    flatSearchFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    existingSearchFieldMetadataKeys.add(
      `${flatSearchFieldMetadata.objectMetadataId}:${flatSearchFieldMetadata.fieldMetadataId}`,
    );
  }

  const flatSearchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[] =
    [];

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      flatObjectMetadata.applicationId === twentyStandardApplicationId ||
      flatObjectMetadata.applicationId === workspaceCustomApplicationId
    ) {
      continue;
    }

    if (flatObjectMetadata.isSearchable !== true) {
      continue;
    }

    const applicationUniversalIdentifier =
      applicationUniversalIdentifierById.get(flatObjectMetadata.applicationId);

    if (!isDefined(applicationUniversalIdentifier)) {
      continue;
    }

    const labelIdentifierFieldMetadataUniversalIdentifier =
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
      continue;
    }

    const derivedIdFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      name: 'id',
    });

    if (
      labelIdentifierFieldMetadataUniversalIdentifier ===
      derivedIdFieldUniversalIdentifier
    ) {
      continue;
    }

    const labelIdentifierFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        labelIdentifierFieldMetadataUniversalIdentifier
      ];

    if (
      !isDefined(labelIdentifierFlatFieldMetadata) ||
      !isSearchableFieldType(labelIdentifierFlatFieldMetadata.type)
    ) {
      continue;
    }

    if (
      existingSearchFieldMetadataKeys.has(
        `${flatObjectMetadata.id}:${labelIdentifierFlatFieldMetadata.id}`,
      )
    ) {
      continue;
    }

    const tsVectorFlatFieldMetadata = findTsVectorFlatFieldMetadataForObject({
      fieldUniversalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
      flatFieldMetadataMaps,
    });

    if (!isDefined(tsVectorFlatFieldMetadata)) {
      continue;
    }

    flatSearchFieldMetadatasToCreate.push(
      buildFlatSearchFieldMetadataForField({
        flatObjectMetadata,
        flatFieldMetadata: labelIdentifierFlatFieldMetadata,
        tsVectorFlatFieldMetadata,
        position: 0,
      }),
    );
  }

  return fromArrayToValuesByKeyRecord({
    array: flatSearchFieldMetadatasToCreate,
    key: 'applicationUniversalIdentifier',
  });
};
