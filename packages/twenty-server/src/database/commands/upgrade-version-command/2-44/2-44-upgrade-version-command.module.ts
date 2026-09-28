import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { VerifyCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790590808102-verify-common-record-sharing.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceIteratorModule, WorkspaceCacheModule],
  providers: [VerifyCommonRecordSharingCommand],
})
export class V2_44_UpgradeVersionCommandModule {}
