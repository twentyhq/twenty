import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RemoveTwentyStandardApplicationRoleCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795791151025-remove-twenty-standard-application-role.command';
import { MoveAdminRoleToWorkspaceCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795795170237-move-admin-role-to-workspace-custom-application.command';
import { ApplicationGrantRoleModule } from 'src/engine/core-modules/application/application-grant-role/application-grant-role.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApplicationGrantRoleModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    RemoveTwentyStandardApplicationRoleCommand,
    MoveAdminRoleToWorkspaceCustomApplicationCommand,
  ],
})
export class V2_66_UpgradeVersionCommandModule {}
