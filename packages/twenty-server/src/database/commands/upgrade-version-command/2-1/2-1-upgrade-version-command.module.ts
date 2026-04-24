import { Module } from '@nestjs/common';

import { AddLayoutCustomizationGuardToEditCommandsCommand } from 'src/database/commands/upgrade-version-command/2-1/2-1-workspace-command-1795000001000-add-layout-customization-guard-to-edit-commands.command';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
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
  providers: [AddLayoutCustomizationGuardToEditCommandsCommand],
})
export class V2_1_UpgradeVersionCommandModule {}
