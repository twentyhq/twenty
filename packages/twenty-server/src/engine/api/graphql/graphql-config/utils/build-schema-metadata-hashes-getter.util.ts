import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SCHEMA_METADATA_CACHE_DEPENDENCIES = [
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
] as const;

export const buildSchemaMetadataHashesGetter =
  (workspaceCacheService: WorkspaceCacheService) =>
  (workspaceId: string): string | undefined => {
    const localHashes = workspaceCacheService.peekLocalHashes(workspaceId, [
      ...SCHEMA_METADATA_CACHE_DEPENDENCIES,
    ]);
    const orderedHashes = SCHEMA_METADATA_CACHE_DEPENDENCIES.map(
      (cacheKeyName) => localHashes[cacheKeyName],
    );

    if (!orderedHashes.every(isDefined)) {
      return undefined;
    }

    return orderedHashes.join('.');
  };
