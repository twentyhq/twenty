import { Module } from '@nestjs/common';

import { GraphqlQueryRunnerModule } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

import { WorkspaceResolverFactory } from './workspace-resolver.factory';

import { workspaceResolverBuilderFactories } from './factories/factories';

@Module({
  imports: [
    WorkspaceQueryRunnerModule,
    GraphqlQueryRunnerModule,
    FeatureFlagModule,
  ],
  providers: [
    ...workspaceResolverBuilderFactories,
    WorkspaceResolverFactory,
    WorkspaceResolverBuilderService,
  ],
  exports: [WorkspaceResolverFactory, WorkspaceResolverBuilderService],
})
export class WorkspaceResolverBuilderModule {}
