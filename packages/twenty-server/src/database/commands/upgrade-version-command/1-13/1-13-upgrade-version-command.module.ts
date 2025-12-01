import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrateTimelineActivityToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-timeline-activity-to-morph-relations.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      TimelineActivityWorkspaceEntity,
    ]),
    DataSourceModule,
    WorkspaceSchemaManagerModule,
    FeatureFlagModule,
    WorkspaceCacheStorageModule,
    ObjectMetadataModule,
    ApplicationModule,
  ],
  providers: [MigrateTimelineActivityToMorphRelationsCommand],
  exports: [MigrateTimelineActivityToMorphRelationsCommand],
})
export class V1_13_UpgradeVersionCommandModule {}
