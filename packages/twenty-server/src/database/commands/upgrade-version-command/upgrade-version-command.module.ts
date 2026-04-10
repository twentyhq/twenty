import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { V1_21_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-21/1-21-upgrade-version-command.module';
import { V1_22_UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/1-22/1-22-upgrade-version-command.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { CoreEngineVersionModule } from 'src/engine/core-engine-version/core-engine-version.module';
import { UpgradeModule } from 'src/engine/core-modules/upgrade/upgrade.module';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';

@Module({
  imports: [
    V1_21_UpgradeVersionCommandModule,
    V1_22_UpgradeVersionCommandModule,
    CoreEngineVersionModule,
    UpgradeModule,
    WorkspaceVersionModule,
    WorkspaceIteratorModule,
  ],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
