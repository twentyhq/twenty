import { Module } from '@nestjs/common';

import { GraphqlQueryRunnerService } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-runner.service';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
@Module({
  imports: [
    WorkspaceQueryHookModule,
    WorkspaceQueryRunnerModule,
    FeatureFlagModule,
  ],
  providers: [GraphqlQueryRunnerService],
  exports: [GraphqlQueryRunnerService],
})
export class GraphqlQueryRunnerModule {}
