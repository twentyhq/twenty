import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const API_KEY_ROWS_REQUIREMENT = {
  apiKey: true,
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('apiKeyMap', { packingPonderation: 1 })
export class WorkspaceApiKeyMapCacheService extends WorkspaceCacheProvider<
  Record<string, FlatApiKey>
> {
  override readonly rowsRequirement = API_KEY_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<typeof API_KEY_ROWS_REQUIREMENT>): Record<
    string,
    FlatApiKey
  > {
    const { apiKey: apiKeys } = rows;

    return apiKeys.reduce(
      (map, apiKey) => {
        map[apiKey.id] = fromApiKeyEntityToFlat(apiKey);

        return map;
      },
      {} as Record<string, FlatApiKey>,
    );
  }
}
