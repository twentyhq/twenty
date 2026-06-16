import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateManualTriggerVariablesToPayloadCommand } from 'src/database/commands/upgrade-version-command/2-15/2-15-workspace-command-1800000001000-migrate-manual-trigger-variables-to-payload.command';

@Module({
  imports: [WorkspaceIteratorModule],
  providers: [MigrateManualTriggerVariablesToPayloadCommand],
})
export class V2_15_UpgradeVersionCommandModule {}
