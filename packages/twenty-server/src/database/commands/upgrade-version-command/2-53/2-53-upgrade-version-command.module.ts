import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChatAssistantParticipationCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793111719062-add-chat-assistant-participation.command';
import { MoveApplicationAndSystemAccessToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793176233512-move-application-and-system-access-to-disabled-actions.command';
import { UngateMergeFromDuplicateCriteriaCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793180997766-ungate-merge-from-duplicate-criteria.command';
import { GateMergeCommandOnRecordPermissionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793183175063-gate-merge-command-on-record-permissions.command';
import { SyncWorkspaceMemberRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793192231470-sync-workspace-member-record-page.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddChatAssistantParticipationCommand,
    MoveApplicationAndSystemAccessToDisabledActionsCommand,
    UngateMergeFromDuplicateCriteriaCommand,
    GateMergeCommandOnRecordPermissionsCommand,
    SyncWorkspaceMemberRecordPageCommand,
  ],
})
export class V2_53_UpgradeVersionCommandModule {}
