import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UpdateDashboardBuildingSkillPageLayoutToolsCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794489929066-update-dashboard-building-skill-page-layout-tools.command';
import { ExcludeDeletedRecordsFromUniqueFieldIndexesCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794498818636-exclude-deleted-records-from-unique-field-indexes.command';
import { MoveWorkspaceFieldMetadataOptionsToWorkspaceApplicationCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794521930485-move-workspace-field-metadata-options-to-workspace-application.command';
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
    UpdateDashboardBuildingSkillPageLayoutToolsCommand,
    ExcludeDeletedRecordsFromUniqueFieldIndexesCommand,
    MoveWorkspaceFieldMetadataOptionsToWorkspaceApplicationCommand,
  ],
})
export class V2_59_UpgradeVersionCommandModule {}
