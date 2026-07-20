import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { isSearchVectorGinFlatIndexMetadata } from 'src/database/commands/upgrade-version-command/2-20/utils/is-search-vector-gin-flat-index-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type SearchVectorGinIndexUniversalIdentifierUpdate = {
  id: string;
  name: string;
  deterministicUniversalIdentifier: string;
};

type BuildSearchVectorGinIndexReOwnOperationsArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  applicationUniversalIdentifierById: Map<string, string>;
};

// Re-own is global (every application, including twenty-standard and workspace-custom):
// every existing searchVector GIN index whose universal identifier drifted from its
// getIndexUniversalIdentifier derivation is converged back to it.
export const buildSearchVectorGinIndexReOwnOperations = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  applicationUniversalIdentifierById,
}: BuildSearchVectorGinIndexReOwnOperationsArgs): SearchVectorGinIndexUniversalIdentifierUpdate[] => {
  const indexUniversalIdentifierUpdates: SearchVectorGinIndexUniversalIdentifierUpdate[] =
    [];

  for (const flatIndexMetadata of Object.values(
    flatIndexMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      !isSearchVectorGinFlatIndexMetadata({
        flatIndexMetadata,
        flatFieldMetadataMaps,
      })
    ) {
      continue;
    }

    const applicationUniversalIdentifier =
      applicationUniversalIdentifierById.get(flatIndexMetadata.applicationId);
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatIndexMetadata.objectMetadataId,
    });

    if (
      !isDefined(applicationUniversalIdentifier) ||
      !isDefined(flatObjectMetadata)
    ) {
      continue;
    }

    const deterministicUniversalIdentifier = getIndexUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      name: flatIndexMetadata.name,
    });

    if (
      deterministicUniversalIdentifier === flatIndexMetadata.universalIdentifier
    ) {
      continue;
    }

    indexUniversalIdentifierUpdates.push({
      id: flatIndexMetadata.id,
      name: flatIndexMetadata.name,
      deterministicUniversalIdentifier,
    });
  }

  return indexUniversalIdentifierUpdates;
};
