import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropWorkflowRunRuleRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876879146-drop-workflow-run-rule-record-shares.command';
import { AddAccessAllRecordsPermissionFlagCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876819146-add-access-all-records-permission-flag.command';
import { OpenShareRecordToEveryObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876759146-open-share-record-to-every-object.command';
import { AddRecordShareNoneAccessLevelCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876639146-add-record-share-none-access-level.command';
import { RestrictExportRecordsToIndexPageCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790837443029-restrict-export-records-to-index-page.command';
import { GateWorkflowCommandsOnRecordUpdatePermissionCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790853316722-gate-workflow-commands-on-record-update-permission.command';
import { RemoveSeeVersionWorkflowRunCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790860694324-remove-see-version-workflow-run-command-menu-item.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RestrictExportRecordsToIndexPageCommand,
    AddRecordShareNoneAccessLevelCommand,
    GateWorkflowCommandsOnRecordUpdatePermissionCommand,
    RemoveSeeVersionWorkflowRunCommandMenuItemCommand,
    OpenShareRecordToEveryObjectCommand,
    AddAccessAllRecordsPermissionFlagCommand,
    DropWorkflowRunRuleRecordSharesCommand,
  ],
})
export class V2_45_UpgradeVersionCommandModule {}
