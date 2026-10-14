import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncCampaignComposerStandardMetadataCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791974245088-sync-campaign-composer-standard-metadata.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [SyncCampaignComposerStandardMetadataCommand],
})
export class V2_48_UpgradeVersionCommandModule {}
