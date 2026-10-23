import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ReconcileStandardSkillCatalogCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792764632845-reconcile-standard-skill-catalog.command';
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
  ],
})
export class V2_52_UpgradeVersionCommandModule {}
