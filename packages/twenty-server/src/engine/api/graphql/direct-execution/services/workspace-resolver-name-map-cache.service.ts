import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import {
  type ResolverNameMapEntry,
  buildResolverNameMap,
} from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
@WorkspaceCache('graphQLResolverNameMap')
export class WorkspaceResolverNameMapCacheService extends WorkspaceCacheProvider<
  Record<string, ResolverNameMapEntry>
> {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<Record<string, ResolverNameMapEntry>> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return buildResolverNameMap(flatObjectMetadataMaps);
  }
}
