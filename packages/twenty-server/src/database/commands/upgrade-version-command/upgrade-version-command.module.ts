import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { V0_54_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-54/0-54-upgrade-version-command.module';
import { V0_55_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-55/0-55-upgrade-version-command.module';
import { V0_56_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/0-56/0-56-upgrade-version-command.module';
import {
  DatabaseMigrationService,
  UpgradeCommand,
} from 'src/database/commands/upgrade-version-command/upgrade.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    V0_54_UpgradeVersionCommandModule,
    V0_55_UpgradeVersionCommandModule,
    V0_56_UpgradeVersionCommandModule,
    WorkspaceSyncMetadataModule,
  ],
  providers: [DatabaseMigrationService, UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
