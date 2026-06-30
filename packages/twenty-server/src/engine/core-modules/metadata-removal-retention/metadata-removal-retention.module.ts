import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetadataRemovalRetentionCronCommand } from 'src/engine/core-modules/metadata-removal-retention/commands/metadata-removal-retention.cron.command';
import { MetadataRemovalRetentionCronJob } from 'src/engine/core-modules/metadata-removal-retention/crons/metadata-removal-retention.cron.job';
import { MetadataRemovalRetentionJob } from 'src/engine/core-modules/metadata-removal-retention/jobs/metadata-removal-retention.job';
import { PendingMetadataDropEntity } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.entity';
import { PendingMetadataDropService } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.service';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingMetadataDropEntity]),
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    PendingMetadataDropService,
    MetadataRemovalRetentionJob,
    MetadataRemovalRetentionCronJob,
    MetadataRemovalRetentionCronCommand,
  ],
  exports: [PendingMetadataDropService, MetadataRemovalRetentionCronCommand],
})
export class MetadataRemovalRetentionModule {}
