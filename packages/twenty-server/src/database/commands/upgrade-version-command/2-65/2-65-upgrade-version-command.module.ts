import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ProvisionRichTextFilesColumnsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command';
import { ConvertFormulaFieldsToTreesCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795719181224-convert-formula-fields-to-trees.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [ProvisionRichTextFilesColumnsCommand, ConvertFormulaFieldsToTreesCommand],
})
export class V2_65_UpgradeVersionCommandModule {}
