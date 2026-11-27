import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RemoveTwentyStandardApplicationRoleCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795791151025-remove-twenty-standard-application-role.command';
import { RenameAgentChatObjectsToInboxCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795794146718-rename-agent-chat-objects-to-inbox.command';
import { ApplicationGrantRoleModule } from 'src/engine/core-modules/application/application-grant-role/application-grant-role.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationGrantRoleModule,
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    RemoveTwentyStandardApplicationRoleCommand,
    RenameAgentChatObjectsToInboxCommand,
  ],
})
export class V2_66_UpgradeVersionCommandModule {}
