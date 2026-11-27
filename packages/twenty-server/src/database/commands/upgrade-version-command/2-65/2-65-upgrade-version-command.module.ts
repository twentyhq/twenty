import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ProvisionRichTextFilesColumnsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command';
import { ConvertFormulaFieldsToTreesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795719181224-convert-formula-fields-to-trees.command';
import { ConvertValidationRulesToTreesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795719490856-convert-validation-rules-to-trees.command';
import { ConvertTriggerConditionsToTreesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795720389116-convert-trigger-conditions-to-trees.command';
import { UpdateSettingsGoToCommandLabelsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795732352221-update-settings-go-to-command-labels.command';
import { LockSyncedCalendarEventFieldsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795732998738-lock-synced-calendar-event-fields.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    ProvisionRichTextFilesColumnsCommand,
    ConvertFormulaFieldsToTreesCommand,
    ConvertValidationRulesToTreesCommand,
    ConvertTriggerConditionsToTreesCommand,
    UpdateSettingsGoToCommandLabelsCommand,
    LockSyncedCalendarEventFieldsCommand,
  ],
})
export class V2_65_UpgradeVersionCommandModule {}
