import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';

import { workspaceResolverBuilderFactories } from './factories/factories';

@Module({
  imports: [CoreCommonApiModule],
  providers: [
    ...workspaceResolverBuilderFactories,
    WorkspaceResolverBuilderService,
  ],
  exports: [
    ...workspaceResolverBuilderFactories,
    WorkspaceResolverBuilderService,
  ],
})
export class WorkspaceResolverBuilderModule {}
