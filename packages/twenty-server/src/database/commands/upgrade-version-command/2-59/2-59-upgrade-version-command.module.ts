import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UpdateDashboardBuildingSkillPageLayoutToolsCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794489929066-update-dashboard-building-skill-page-layout-tools.command';
import { MoveWorkspaceFieldMetadataOptionsToWorkspaceApplicationCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794499300000-move-workspace-field-metadata-options-to-workspace-application.command';
import { AlignFieldMetadataOptionRowsWithStoredOptionsCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794508090443-align-field-metadata-option-rows-with-stored-options.command';
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
  providers: [
    UpdateDashboardBuildingSkillPageLayoutToolsCommand,
    MoveWorkspaceFieldMetadataOptionsToWorkspaceApplicationCommand,
    AlignFieldMetadataOptionRowsWithStoredOptionsCommand,
  ],
})
export class V2_59_UpgradeVersionCommandModule {}
