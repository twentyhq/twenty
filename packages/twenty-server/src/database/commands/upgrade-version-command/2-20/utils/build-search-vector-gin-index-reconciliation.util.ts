import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { fromArrayToValuesByKeyRecord, isDefined } from 'twenty-shared/utils';

import { isSearchVectorGinFlatIndexMetadata } from 'src/database/commands/upgrade-version-command/2-20/utils/is-search-vector-gin-flat-index-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { buildSearchVectorGinIndexForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-gin-index-for-custom-object.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type SearchVectorGinIndexUniversalIdentifierUpdate = {
  id: string;
  name: string;
  deterministicUniversalIdentifier: string;
};

type BuildSearchVectorGinIndexReconciliationArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  applicationUniversalIdentifierById: Map<string, string>;
  installedApplicationIds: Set<string>;
};

type BuildSearchVectorGinIndexReconciliationReturnType = {
  indexUniversalIdentifierUpdates: SearchVectorGinIndexUniversalIdentifierUpdate[];
  flatIndexesToCreateByApplicationUniversalIdentifier: Record<
    string,
    UniversalFlatIndexMetadata[]
  >;
};

// Reconciles the deterministic universal identifier of every object's searchVector
// GIN index. Re-own is global (every application): existing indexes carrying a legacy
// v4 identifier are converged to getIndexUniversalIdentifier. Creation is limited to
// installed-app objects, whose GIN index was never provisioned by the manifest funnel.
export const buildSearchVectorGinIndexReconciliation = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  applicationUniversalIdentifierById,
  installedApplicationIds,
}: BuildSearchVectorGinIndexReconciliationArgs): BuildSearchVectorGinIndexReconciliationReturnType => {
  const indexUniversalIdentifierUpdates: SearchVectorGinIndexUniversalIdentifierUpdate[] =
    [];
  const searchVectorGinIndexByObjectMetadataId = new Map<
    string,
    FlatIndexMetadata
  >();

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

    searchVectorGinIndexByObjectMetadataId.set(
      flatIndexMetadata.objectMetadataId,
      flatIndexMetadata,
    );

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

  const flatIndexesToCreate: UniversalFlatIndexMetadata[] = [];

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (!installedApplicationIds.has(flatObjectMetadata.applicationId)) {
      continue;
    }

    if (searchVectorGinIndexByObjectMetadataId.has(flatObjectMetadata.id)) {
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

  return {
    indexUniversalIdentifierUpdates,
    flatIndexesToCreateByApplicationUniversalIdentifier:
      fromArrayToValuesByKeyRecord({
        array: flatIndexesToCreate,
        key: 'applicationUniversalIdentifier',
      }),
  };
};
