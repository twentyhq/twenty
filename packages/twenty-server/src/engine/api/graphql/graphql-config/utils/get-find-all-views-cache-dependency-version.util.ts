import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const FIND_ALL_VIEWS_CACHE_DEPENDENCIES = [
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatViewFieldGroupMaps',
  'flatViewGroupMaps',
  'flatViewSortMaps',
  'flatViewFilterMaps',
  'flatViewFilterGroupMaps',
] as const satisfies readonly WorkspaceCacheKeyName[];

export const getFindAllViewsCacheDependencyVersion = async ({
  workspaceCacheService,
  workspaceId,
}: {
  workspaceCacheService: WorkspaceCacheService;
  workspaceId: string;
}): Promise<string | undefined> => {
  let cacheHashes = await workspaceCacheService.getCacheHashes(workspaceId, [
    ...FIND_ALL_VIEWS_CACHE_DEPENDENCIES,
  ]);
  const missingDependencies = FIND_ALL_VIEWS_CACHE_DEPENDENCIES.filter(
    (dependency) => !isDefined(cacheHashes[dependency]),
  );

  if (missingDependencies.length > 0) {
    await workspaceCacheService.getOrRecompute(workspaceId, [
      ...missingDependencies,
    ]);
    cacheHashes = await workspaceCacheService.getCacheHashes(workspaceId, [
      ...FIND_ALL_VIEWS_CACHE_DEPENDENCIES,
    ]);
  }

  const dependencyValues: string[] = [];

  for (const dependency of FIND_ALL_VIEWS_CACHE_DEPENDENCIES) {
    const cacheHash = cacheHashes[dependency];

    if (!isDefined(cacheHash)) {
      return undefined;
    }

    dependencyValues.push(`${dependency}:${cacheHash}`);
  }

  return createHash('sha256').update(dependencyValues.join('|')).digest('hex');
};
