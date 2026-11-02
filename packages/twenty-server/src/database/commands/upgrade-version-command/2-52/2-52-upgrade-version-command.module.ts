import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ReconcileStandardSkillCatalogCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792764632845-reconcile-standard-skill-catalog.command';
import { BackfillFilesRecordFormWidgetsCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792861553907-backfill-files-record-form-widgets.command';
import { SeedWorkspaceFrontendDependenciesCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792766943126-seed-workspace-frontend-dependencies.command';
import { EnableGlobalChatCommandsCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1793006385503-enable-global-chat-commands.command';
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
    EnableGlobalChatCommandsCommand,
  ],
})
export class V2_52_UpgradeVersionCommandModule {}
