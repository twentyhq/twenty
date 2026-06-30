import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('apiKeyMap')
export class WorkspaceApiKeyMapCacheService extends WorkspaceCacheProvider<
  Record<string, FlatApiKey>
> {
  constructor(
    @InjectWorkspaceScopedRepository(ApiKeyEntity)
    private readonly apiKeyRepository: WorkspaceScopedRepository<ApiKeyEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<Record<string, FlatApiKey>> {
    const apiKeys = await this.apiKeyRepository.find(workspaceId);

    return apiKeys.reduce(
      (map, apiKey) => {
        map[apiKey.id] = fromApiKeyEntityToFlat(apiKey);

        return map;
      },
      {} as Record<string, FlatApiKey>,
    );
  }
}
