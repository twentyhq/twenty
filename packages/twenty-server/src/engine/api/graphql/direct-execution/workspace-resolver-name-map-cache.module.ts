import { Module } from '@nestjs/common';

import { WorkspaceResolverNameMapCacheService } from 'src/engine/api/graphql/direct-execution/services/workspace-resolver-name-map-cache.service';

@Module({
  providers: [WorkspaceResolverNameMapCacheService],
  exports: [WorkspaceResolverNameMapCacheService],
})
export class WorkspaceResolverNameMapCacheModule {}
