import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import {
  type ResolverNameMapEntry,
  buildResolverNameMap,
} from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';

@Injectable()
@WorkspaceCache('graphQLResolverNameMap', { packingPonderation: 4 })
export class WorkspaceResolverNameMapCacheService extends WorkspaceCacheProvider<
  Record<string, ResolverNameMapEntry>
> {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {
    super();
  }

  async computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<Record<string, ResolverNameMapEntry>> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        recomputeContext.workspaceId,
        ['flatObjectMetadataMaps'],
      );

    return buildResolverNameMap(flatObjectMetadataMaps);
  }
}
