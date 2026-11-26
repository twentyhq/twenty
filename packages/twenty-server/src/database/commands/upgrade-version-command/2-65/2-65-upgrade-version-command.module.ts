import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { StripFormulaFieldTextsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795696302450-strip-formula-field-texts.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule, WorkspaceMigrationModule],
  providers: [StripFormulaFieldTextsCommand],
})
export class V2_65_UpgradeVersionCommandModule {}
