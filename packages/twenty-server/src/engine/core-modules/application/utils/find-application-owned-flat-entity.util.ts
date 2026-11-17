import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

export const findApplicationOwnedFlatEntity = async ({
  flatEntityMapsCacheService,
  metadataName,
  entityId,
  workspaceId,
}: {
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  metadataName: AllMetadataName;
  entityId: string;
  workspaceId: string;
}): Promise<SyncableFlatEntity | undefined> => {
  const flatMapsKey = getMetadataFlatEntityMapsKey(metadataName);

  const flatEntityMapsByKey =
    await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
      workspaceId,
      flatMapsKeys: [flatMapsKey],
    });

  const flatEntityMaps: FlatEntityMaps<SyncableFlatEntity> =
    flatEntityMapsByKey[flatMapsKey];

  return findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: entityId,
    flatEntityMaps,
  });
};
