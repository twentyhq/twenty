import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillUserWorkspaceDefaultAvatarFileIdCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795527654001-backfill-user-workspace-default-avatar-file-id.command';

@Module({
  imports: [WorkspaceIteratorModule],
  providers: [BackfillUserWorkspaceDefaultAvatarFileIdCommand],
})
export class V2_64_UpgradeVersionCommandModule {}
