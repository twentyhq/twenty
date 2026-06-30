import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';
import { UpgradeModule } from 'src/engine/core-modules/upgrade/upgrade.module';

@Module({
  imports: [UpgradeModule, WorkspaceIteratorModule],
  providers: [UpgradeCommand],
})
export class UpgradeVersionCommandModule {}
