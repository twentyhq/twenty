import { Module } from '@nestjs/common';

import { WorkspaceQueryBuilderModule } from 'src/engine/api/graphql/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspacePreQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.module';
import { workspaceQueryRunnerFactories } from 'src/engine/api/graphql/workspace-query-runner/factories';
import { RecordPositionListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/record-position.listener';
import { AuthModule } from 'src/engine/modules/auth/auth.module';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

@Module({
  imports: [
    AuthModule,
    WorkspaceQueryBuilderModule,
    WorkspaceDataSourceModule,
    WorkspacePreQueryHookModule,
  ],
  providers: [
    WorkspaceQueryRunnerService,
    ...workspaceQueryRunnerFactories,
    RecordPositionListener,
  ],
  exports: [WorkspaceQueryRunnerService],
})
export class WorkspaceQueryRunnerModule {}
