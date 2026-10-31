import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillWebhookAdminRoleCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793369399691-backfill-webhook-admin-role.command';
import { AddStandardRelatedRecordPathsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793375369182-add-standard-related-record-paths.command';
import { SyncAccessGroupObjectCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793384492383-sync-access-group-object.command';
import { AddAccessGroupStorageColumnsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793391296027-add-access-group-storage-columns.command';
import { AddPrivateRecordColumnCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793436309311-add-private-record-column.command';
import { MakeRestrictedRecordsPrivateCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793457458179-make-restricted-records-private.command';
import { MakeChatThreadsPrivateRecordsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793460623155-make-chat-threads-private-records.command';
import { InlineWorkflowStepAgentsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793446972324-inline-workflow-step-agents.command';
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
    AddPrivateRecordColumnCommand,
    MakeRestrictedRecordsPrivateCommand,
    MakeChatThreadsPrivateRecordsCommand,
    InlineWorkflowStepAgentsCommand,
  ],
})
export class V2_55_UpgradeVersionCommandModule {}
