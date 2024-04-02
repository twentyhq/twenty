import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceQueryBuilderModule } from 'src/engine/api/graphql/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspacePreQueryHookModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/workspace-pre-query-hook.module';
import { workspaceQueryRunnerFactories } from 'src/engine/api/graphql/workspace-query-runner/factories';
import { RecordPositionListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/record-position.listener';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { EventObjectMetadata } from 'src/modules/event/standard-objects/event.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

import { EntityEventsToDbListener } from './listeners/entity-events-to-db.listener';

@Module({
  imports: [
    AuthModule,
    WorkspaceQueryBuilderModule,
    WorkspaceDataSourceModule,
    WorkspacePreQueryHookModule,
    TypeOrmModule.forFeature([Workspace, FeatureFlagEntity], 'core'),
    ObjectMetadataRepositoryModule.forFeature([
      WorkspaceMemberObjectMetadata,
      EventObjectMetadata,
    ]),
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
