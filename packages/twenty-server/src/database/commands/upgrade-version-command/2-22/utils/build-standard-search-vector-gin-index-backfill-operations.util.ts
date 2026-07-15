import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { fromArrayToValuesByKeyRecord, isDefined } from 'twenty-shared/utils';

import { isSearchVectorGinFlatIndexMetadata } from 'src/database/commands/upgrade-version-command/2-20/utils/is-search-vector-gin-flat-index-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { buildSearchVectorGinIndexForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-gin-index-for-custom-object.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

// Object universal identifiers of the twenty-standard objects that declare a searchVector
// GIN index in the manifest. Restricting the backfill to these excludes objects whose
// searchVector is intentionally left without a GIN index (e.g. the borderline UUID-only
// searchable objects and non-searchable objects), so the backfill only creates indexes the
// manifest actually declares.
const STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS_DECLARING_SEARCH_VECTOR_GIN_INDEX =
  new Set<string>(
    Object.values(STANDARD_OBJECTS)
      .filter((standardObject) =>
        Object.keys(standardObject.indexes).includes('searchVectorGinIndex'),
      )
      .map((standardObject) => standardObject.universalIdentifier),
  );

type BuildStandardSearchVectorGinIndexBackfillOperationsArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  twentyStandardApplicationId: string;
};

// Backfills the searchVector GIN index for twenty-standard objects that declare it in the
// manifest but are still missing it in existing workspaces (the objects whose declaration
// was only just added and previously relied on runtime side-effect creation). The 2-20
// backfill deliberately skips twenty-standard, so this covers that gap. Grouped by
// application universal identifier for the per-application migration run.
export const buildStandardSearchVectorGinIndexBackfillOperations = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  twentyStandardApplicationId,
}: BuildStandardSearchVectorGinIndexBackfillOperationsArgs): Record<
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
      flatObjectMetadata.applicationId !== twentyStandardApplicationId ||
      !STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS_DECLARING_SEARCH_VECTOR_GIN_INDEX.has(
        flatObjectMetadata.universalIdentifier,
      )
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
