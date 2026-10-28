import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChatAssistantParticipationCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793111719062-add-chat-assistant-participation.command';
import { MoveApplicationAndSystemAccessToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793176233512-move-application-and-system-access-to-disabled-actions.command';
import { UngateMergeFromDuplicateCriteriaCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793180997766-ungate-merge-from-duplicate-criteria.command';
import { GateMergeCommandOnRecordPermissionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793183175063-gate-merge-command-on-record-permissions.command';
import { SyncWorkspaceMemberRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793192231470-sync-workspace-member-record-page.command';
import { BackfillStandardPermissionFlagsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793198086907-backfill-standard-permission-flags.command';
import { MigrateLambdaDependencyLayersToV1Command } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793203857853-migrate-lambda-dependency-layers-to-v1.command';
import { MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793205123864-move-application-and-system-field-writability-to-disabled-actions.command';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationPackageModule,
    CacheLockModule,
    CoreEntityCacheModule,
    SdkClientModule,
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
    BackfillStandardPermissionFlagsCommand,
    MigrateLambdaDependencyLayersToV1Command,
    MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand,
  ],
})
export class V2_53_UpgradeVersionCommandModule {}
