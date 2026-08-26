import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import {
  type ResolverNameMapEntry,
  buildResolverNameMap,
} from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const GRAPHQL_RESOLVER_NAME_ROWS_REQUIREMENT = {
  objectMetadata: ['universalIdentifier', 'nameSingular', 'namePlural'],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('graphQLResolverNameMap', { packingPonderation: 4 })
export class WorkspaceResolverNameMapCacheService extends WorkspaceCacheProvider<
  Record<string, ResolverNameMapEntry>
> {
  override readonly rowsRequirement = GRAPHQL_RESOLVER_NAME_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof GRAPHQL_RESOLVER_NAME_ROWS_REQUIREMENT
  >): Record<string, ResolverNameMapEntry> {
    return buildResolverNameMap(rows.objectMetadata);
  }
}
