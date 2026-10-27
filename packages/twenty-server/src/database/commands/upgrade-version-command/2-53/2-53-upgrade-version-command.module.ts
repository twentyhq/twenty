import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MoveApplicationAndSystemAccessToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793150000001-move-application-and-system-access-to-disabled-actions.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [MoveApplicationAndSystemAccessToDisabledActionsCommand],
})
export class V2_53_UpgradeVersionCommandModule {}
