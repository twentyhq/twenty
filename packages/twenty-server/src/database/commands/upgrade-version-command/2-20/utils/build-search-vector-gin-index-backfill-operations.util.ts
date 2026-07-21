import { fromArrayToValuesByKeyRecord, isDefined } from 'twenty-shared/utils';

import { isSearchVectorGinFlatIndexMetadata } from 'src/database/commands/upgrade-version-command/2-20/utils/is-search-vector-gin-flat-index-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { buildSearchVectorGinIndexForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-gin-index-for-custom-object.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

type BuildSearchVectorGinIndexBackfillOperationsArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  twentyStandardApplicationId: string;
  workspaceCustomApplicationId: string;
};

// Backfill skips the twenty-standard and workspace-custom applications (their GIN index is
// already provisioned by the manifest funnel) and targets every other (installed)
// application object that has a searchVector field but no GIN index yet. Grouped by
// application universal identifier for the per-application migration run.
export const buildSearchVectorGinIndexBackfillOperations = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  twentyStandardApplicationId,
  workspaceCustomApplicationId,
}: BuildSearchVectorGinIndexBackfillOperationsArgs): Record<
  string,
  UniversalFlatIndexMetadata[]
> => {
  const objectMetadataIdsWithSearchVectorGinIndex = new Set<string>();

  for (const flatIndexMetadata of Object.values(
    flatIndexMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      isSearchVectorGinFlatIndexMetadata({
        flatIndexMetadata,
        flatFieldMetadataMaps,
      })
    ) {
      objectMetadataIdsWithSearchVectorGinIndex.add(
        flatIndexMetadata.objectMetadataId,
      );
    }
  }

  const flatIndexesToCreate: UniversalFlatIndexMetadata[] = [];

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      flatObjectMetadata.applicationId === twentyStandardApplicationId ||
      flatObjectMetadata.applicationId === workspaceCustomApplicationId
    ) {
      continue;
    }

    if (objectMetadataIdsWithSearchVectorGinIndex.has(flatObjectMetadata.id)) {
      continue;
    }

    const tsVectorFlatFieldMetadata = findTsVectorFlatFieldMetadataForObject({
      fieldUniversalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
      flatFieldMetadataMaps,
    });

    if (!isDefined(tsVectorFlatFieldMetadata)) {
      continue;
    }

    flatIndexesToCreate.push(
      buildSearchVectorGinIndexForCustomObject({
        flatObjectMetadata,
        searchVectorFlatFieldMetadata: tsVectorFlatFieldMetadata,
      }),
    );
  }

  return fromArrayToValuesByKeyRecord({
    array: flatIndexesToCreate,
    key: 'applicationUniversalIdentifier',
  });
};
