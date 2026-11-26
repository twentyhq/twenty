import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UpdateMetadataBuildingSkillFormulaFieldsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795700530802-update-metadata-building-skill-formula-fields.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [UpdateMetadataBuildingSkillFormulaFieldsCommand],
})
export class V2_65_UpgradeVersionCommandModule {}
