import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RebuildUniquePhoneIndexesCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-workspace-command-1778000000000-rebuild-unique-phone-indexes.command';
import { NormalizeCompositeFieldDefaultsCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-workspace-command-1778000001000-normalize-composite-field-defaults.command';
import { ResyncTwentyStandardApplicationSpvV25Command } from 'src/database/commands/upgrade-version-command/2-5/2-5-workspace-command-1779456242590-resync-twenty-standard-application-spv.command';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TwentyStandardApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RebuildUniquePhoneIndexesCommand,
    NormalizeCompositeFieldDefaultsCommand,
    ResyncTwentyStandardApplicationSpvV25Command,
  ],
})
export class V2_5_UpgradeVersionCommandModule {}
