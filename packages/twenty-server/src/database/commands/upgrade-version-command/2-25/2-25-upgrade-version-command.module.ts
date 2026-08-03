import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMessageListMembersJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1784567000000-backfill-message-list-members-junction-target.command';
import { ProvisionMessageCampaignStandardMetadataCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785600000000-provision-message-campaign-standard-metadata.command';
import { ProvisionAndBackfillPersonOpenTaskCountCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785700000000-provision-and-backfill-person-open-task-count.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    BackfillMessageListMembersJunctionTargetCommand,
    ProvisionMessageCampaignStandardMetadataCommand,
    ProvisionAndBackfillPersonOpenTaskCountCommand,
  ],
})
export class V2_25_UpgradeVersionCommandModule {}
