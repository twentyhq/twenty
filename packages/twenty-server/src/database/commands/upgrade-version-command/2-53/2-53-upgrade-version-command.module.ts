import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChatAssistantParticipationCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793111719062-add-chat-assistant-participation.command';
import { MoveApplicationAndSystemAccessToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793176233512-move-application-and-system-access-to-disabled-actions.command';
import { UngateMergeFromDuplicateCriteriaCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793180997766-ungate-merge-from-duplicate-criteria.command';
import { RefreshWorkspaceDefaultDependenciesCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793182799028-refresh-workspace-default-dependencies.command';
import { MigrateLambdaDependencyLayersToV1Command } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793182807954-migrate-lambda-dependency-layers-to-v1.command';
import { GateMergeCommandOnRecordPermissionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793183175063-gate-merge-command-on-record-permissions.command';
import { SyncWorkspaceMemberRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793192231470-sync-workspace-member-record-page.command';
import { BackfillStandardPermissionFlagsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793198086907-backfill-standard-permission-flags.command';
import { MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793205123864-move-application-and-system-field-writability-to-disabled-actions.command';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationPackageModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddChatAssistantParticipationCommand,
    MoveApplicationAndSystemAccessToDisabledActionsCommand,
    UngateMergeFromDuplicateCriteriaCommand,
    RefreshWorkspaceDefaultDependenciesCommand,
    MigrateLambdaDependencyLayersToV1Command,
    GateMergeCommandOnRecordPermissionsCommand,
    SyncWorkspaceMemberRecordPageCommand,
    BackfillStandardPermissionFlagsCommand,
    MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand,
  ],
})
export class V2_53_UpgradeVersionCommandModule {}
