import { Module } from '@nestjs/common';

import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { QuickActionsModule } from 'src/engine/core-modules/quick-actions/quick-actions.module';

import { WorkspaceResolverFactory } from './workspace-resolver.factory';

import { workspaceResolverBuilderFactories } from './factories/factories';

@Module({
  imports: [WorkspaceQueryRunnerModule, QuickActionsModule],
  providers: [...workspaceResolverBuilderFactories, WorkspaceResolverFactory],
  exports: [WorkspaceResolverFactory],
})
export class WorkspaceResolverBuilderModule {}
