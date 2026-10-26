import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ReconcileStandardSkillCatalogCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792764632845-reconcile-standard-skill-catalog.command';
import { BackfillFilesRecordFormWidgetsCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792861553907-backfill-files-record-form-widgets.command';
import { AddInboxAndChatsNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1793025684649-add-inbox-and-chats-navigation-menu-items.command';
import { AddWorkspaceNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1793025684650-add-workspace-navigation-menu-section.command';
import { AddCommandsNavigationMenuSectionsCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1793031015299-add-commands-navigation-menu-sections.command';
import { SeedWorkspaceFrontendDependenciesCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792766943126-seed-workspace-frontend-dependencies.command';
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
    ReconcileStandardSkillCatalogCommand,
    SeedWorkspaceFrontendDependenciesCommand,
    BackfillFilesRecordFormWidgetsCommand,
    AddInboxAndChatsNavigationMenuItemsCommand,
    AddWorkspaceNavigationMenuSectionCommand,
    AddCommandsNavigationMenuSectionsCommand,
  ],
})
export class V2_52_UpgradeVersionCommandModule {}
