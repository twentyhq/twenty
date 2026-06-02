import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

// Looks up a core object's icon by its nameSingular. Shared by providers that
// tag descriptor batches with the icon of the underlying object (workflows,
// dashboards) so the UI can render per-tool icons.
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
