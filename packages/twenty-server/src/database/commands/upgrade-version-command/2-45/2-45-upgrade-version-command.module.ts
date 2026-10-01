import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddPositionIdIndexesCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876939146-add-position-id-indexes.command';
import { DropWorkflowRunRuleRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876879146-drop-workflow-run-rule-record-shares.command';
import { OpenShareRecordToEveryObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876759146-open-share-record-to-every-object.command';
import { AddRecordShareNoneAccessLevelCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790876639146-add-record-share-none-access-level.command';
import { RestrictExportRecordsToIndexPageCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790837443029-restrict-export-records-to-index-page.command';
import { GateWorkflowCommandsOnRecordUpdatePermissionCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790853316722-gate-workflow-commands-on-record-update-permission.command';
import { RemoveSeeVersionWorkflowRunCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790860694324-remove-see-version-workflow-run-command-menu-item.command';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    RestrictExportRecordsToIndexPageCommand,
    AddRecordShareNoneAccessLevelCommand,
    GateWorkflowCommandsOnRecordUpdatePermissionCommand,
    RemoveSeeVersionWorkflowRunCommandMenuItemCommand,
    OpenShareRecordToEveryObjectCommand,
    DropWorkflowRunRuleRecordSharesCommand,
    AddPositionIdIndexesCommand,
  ],
})
export class V2_45_UpgradeVersionCommandModule {}
