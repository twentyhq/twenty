import { Module } from '@nestjs/common';

import { CoreCommonApiModule } from 'src/engine/api/common/core-common-api.module';
import { GraphqlQueryRunnerModule } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.module';
import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

import { WorkspaceResolverFactory } from './workspace-resolver.factory';

import { workspaceResolverBuilderFactories } from './factories/factories';

@Module({
  imports: [GraphqlQueryRunnerModule, FeatureFlagModule, CoreCommonApiModule],
  providers: [
    ...workspaceResolverBuilderFactories,
    WorkspaceResolverFactory,
    WorkspaceResolverBuilderService,
  ],
  exports: [WorkspaceResolverFactory, WorkspaceResolverBuilderService],
})
export class WorkspaceResolverBuilderModule {}
