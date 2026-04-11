import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { V1_21_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-21/1-21-upgrade-version-command.module';
import { V1_22_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-22/1-22-upgrade-version-command.module';
import { V1_23_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-23/1-23-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { UpgradeModule } from 'src/engine/core-modules/upgrade/upgrade.module';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';

@Module({
  imports: [
    V1_21_UpgradeVersionCommandModule,
    V1_22_UpgradeVersionCommandModule,
    V1_23_UpgradeVersionCommandModule,
    UpgradeModule,
    WorkspaceVersionModule,
    WorkspaceIteratorModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
