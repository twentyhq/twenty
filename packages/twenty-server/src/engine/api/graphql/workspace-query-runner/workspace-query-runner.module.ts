import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceQueryBuilderModule } from 'src/engine/api/graphql/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspacePreQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.module';
import { workspaceQueryRunnerFactories } from 'src/engine/api/graphql/workspace-query-runner/factories';
import { RecordPositionListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/record-position.listener';
import { AuthModule } from 'src/engine/modules/auth/auth.module';
import { FeatureFlagEntity } from 'src/engine/modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/modules/workspace/workspace.entity';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

import { EntityEventsToDbListener } from './listeners/entity-events-to-db.listener';

@Module({
  imports: [
    AuthModule,
    WorkspaceQueryBuilderModule,
    WorkspaceDataSourceModule,
    WorkspacePreQueryHookModule,
    TypeOrmModule.forFeature([Workspace, FeatureFlagEntity], 'core'),
  ],
  providers: [
    WorkspaceQueryRunnerService,
    ...workspaceQueryRunnerFactories,
    RecordPositionListener,
    EntityEventsToDbListener,
  ],
  exports: [WorkspaceQueryRunnerService],
})
export class WorkspaceQueryRunnerModule {}
