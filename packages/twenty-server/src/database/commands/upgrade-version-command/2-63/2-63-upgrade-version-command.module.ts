import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChannelAssociationAccountOwnerAndHandleCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795432675597-add-channel-association-account-owner-and-handle.command';
import { AddFavoritesNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795441900403-add-favorites-navigation-menu-section.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddChannelAssociationAccountOwnerAndHandleCommand,
    AddFavoritesNavigationMenuSectionCommand,
  ],
})
export class V2_63_UpgradeVersionCommandModule {}
