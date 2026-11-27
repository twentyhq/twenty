import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795788995670-move-marketplace-application-role-holders-to-cloned-roles.command';
import { HandOverMarketplaceApplicationStandaloneRolesCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795788995671-hand-over-marketplace-application-standalone-roles.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    CoreEntityCacheModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    MoveMarketplaceApplicationRoleHoldersToClonedRolesCommand,
    HandOverMarketplaceApplicationStandaloneRolesCommand,
  ],
})
export class V2_66_UpgradeVersionCommandModule {}
