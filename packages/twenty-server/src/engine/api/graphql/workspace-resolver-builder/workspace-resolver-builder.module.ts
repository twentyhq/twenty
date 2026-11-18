import { Module } from '@nestjs/common';

import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';

@Module({
  providers: [WorkspaceResolverBuilderService],
  exports: [WorkspaceResolverBuilderService],
})
export class WorkspaceResolverBuilderModule {}
