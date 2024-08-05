import { Module } from '@nestjs/common';

import { WorkspaceQueryBuilderModule } from 'src/engine/api/graphql/workspace-query-builder/workspace-query-builder.module';
import { RecordPositionBackfillCommand } from 'src/engine/api/graphql/workspace-query-runner/commands/0-20-record-position-backfill.command';
import { workspaceQueryRunnerFactories } from 'src/engine/api/graphql/workspace-query-runner/factories';
import { TelemetryListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/telemetry.listener';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DuplicateModule } from 'src/engine/core-modules/duplicate/duplicate.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

import { EntityEventsToDbListener } from './listeners/entity-events-to-db.listener';

@Module({
  imports: [
    AuthModule,
    WorkspaceQueryBuilderModule,
    WorkspaceDataSourceModule,
    WorkspaceQueryHookModule,
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
    AnalyticsModule,
    DuplicateModule,
    FileModule,
  ],
  providers: [
    WorkspaceQueryRunnerService,
    ...workspaceQueryRunnerFactories,
    EntityEventsToDbListener,
    TelemetryListener,
    RecordPositionBackfillCommand,
  ],
  exports: [WorkspaceQueryRunnerService],
})
export class WorkspaceQueryRunnerModule {}
