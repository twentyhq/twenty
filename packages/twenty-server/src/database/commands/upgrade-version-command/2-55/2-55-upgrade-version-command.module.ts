import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillWebhookAdminRoleCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793369399691-backfill-webhook-admin-role.command';
import { AddStandardRelatedRecordPathsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793375369182-add-standard-related-record-paths.command';
import { SyncAccessGroupObjectCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793384492383-sync-access-group-object.command';
import { AddAccessGroupStorageColumnsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793391296027-add-access-group-storage-columns.command';
import { ReplaceEmailsAndConversationsTabsWithMessagesCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793393802766-replace-emails-and-conversations-tabs-with-messages.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    BackfillWebhookAdminRoleCommand,
    AddStandardRelatedRecordPathsCommand,
    SyncAccessGroupObjectCommand,
    AddAccessGroupStorageColumnsCommand,
    ReplaceEmailsAndConversationsTabsWithMessagesCommand,
  ],
})
export class V2_55_UpgradeVersionCommandModule {}
