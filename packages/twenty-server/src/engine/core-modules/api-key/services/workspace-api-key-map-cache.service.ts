import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';

@Injectable()
@WorkspaceCache('apiKeyMap', { packingPonderation: 1 })
export class WorkspaceApiKeyMapCacheService extends WorkspaceCacheProvider<
  Record<string, FlatApiKey>
> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<Record<string, FlatApiKey>> {
    const apiKeys = await recomputeContext.findAll(ApiKeyEntity);

    return apiKeys.reduce(
      (map, apiKey) => {
        map[apiKey.id] = fromApiKeyEntityToFlat(apiKey);

        return map;
      },
      {} as Record<string, FlatApiKey>,
    );
  }
}
