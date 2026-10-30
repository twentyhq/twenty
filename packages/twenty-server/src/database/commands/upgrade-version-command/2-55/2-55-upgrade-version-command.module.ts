import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddDirectMessagePairIdentityCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793371089726-add-direct-message-pair-identity.command';
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
  providers: [AddDirectMessagePairIdentityCommand],
})
export class V2_55_UpgradeVersionCommandModule {}
