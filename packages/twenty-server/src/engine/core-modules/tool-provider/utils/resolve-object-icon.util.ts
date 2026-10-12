import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

export const resolveObjectIcon = async (
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  workspaceId: string,
  nameSingular: string,
): Promise<string | undefined> => {
  const { flatObjectMetadataMaps } =
    await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatObjectMetadataMaps'],
    });

  const flatObject = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).find((obj) => obj?.nameSingular === nameSingular);

  return flatObject?.icon ?? undefined;
};
