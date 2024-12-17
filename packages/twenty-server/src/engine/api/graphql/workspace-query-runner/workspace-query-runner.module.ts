import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceQueryBuilderModule } from 'src/engine/api/graphql/workspace-query-builder/workspace-query-builder.module';
import { workspaceQueryRunnerFactories } from 'src/engine/api/graphql/workspace-query-runner/factories';
import { TelemetryListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/telemetry.listener';
import { WorkspaceQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.module';
import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { EntityEventsToDbListener } from './listeners/entity-events-to-db.listener';

@Module({
  imports: [
    AuthModule,
    WorkspaceQueryBuilderModule,
    WorkspaceDataSourceModule,
    WorkspaceQueryHookModule,
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    AnalyticsModule,
    TelemetryModule,
    FileModule,
    FeatureFlagModule,
  ],
  providers: [
    ...workspaceQueryRunnerFactories,
    EntityEventsToDbListener,
    TelemetryListener,
  ],
  exports: [...workspaceQueryRunnerFactories],
})
export class WorkspaceQueryRunnerModule {}
