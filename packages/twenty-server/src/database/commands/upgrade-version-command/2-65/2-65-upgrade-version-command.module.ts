import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ProvisionRichTextFilesColumnsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command';
import { ConvertFormulaFieldsToTreesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795719181224-convert-formula-fields-to-trees.command';
import { ConvertValidationRulesToTreesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795719490856-convert-validation-rules-to-trees.command';
import { ConvertTriggerConditionsToTreesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795720389116-convert-trigger-conditions-to-trees.command';
import { UpdateSettingsGoToCommandLabelsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795732352221-update-settings-go-to-command-labels.command';
import { MoveAdminRoleToWorkspaceCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795789135076-move-admin-role-to-workspace-custom-application.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    ProvisionRichTextFilesColumnsCommand,
    ConvertFormulaFieldsToTreesCommand,
    ConvertValidationRulesToTreesCommand,
    ConvertTriggerConditionsToTreesCommand,
    UpdateSettingsGoToCommandLabelsCommand,
    MoveAdminRoleToWorkspaceCustomApplicationCommand,
  ],
})
export class V2_65_UpgradeVersionCommandModule {}
