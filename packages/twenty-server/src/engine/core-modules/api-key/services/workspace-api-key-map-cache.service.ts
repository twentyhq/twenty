import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type FlatApiKey } from 'src/engine/core-modules/Api-key/types/flat-Api-key.type';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/Api-key/utils/from-Api-key-entity-to-flat.util';
import { ApiKeyEntity } from 'src/engine/core-modules/Api-key/Api-key.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('apiKeyMap')
export class WorkspaceApiKeyMapCacheService extends WorkspaceCacheProvider<
  Record<string, FlatApiKey>
> {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<Record<string, FlatApiKey>> {
    const apiKeys = await this.apiKeyRepository.find({
      where: { workspaceId },
    });

    return apiKeys.reduce(
      (map, apiKey) => {
        map[apiKey.id] = fromApiKeyEntityToFlat(apiKey);

        return map;
      },
      {} as Record<string, FlatApiKey>,
    );
  }
}
