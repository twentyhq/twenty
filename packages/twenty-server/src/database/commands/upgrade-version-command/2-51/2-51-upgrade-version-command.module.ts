import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FileSettledAgentChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792612809770-file-settled-agent-chat-threads.command';
import { DeleteConnectedAccountsOutsideProviderScopeCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792675225627-delete-connected-accounts-outside-provider-scope.command';
import { AddAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792686629823-add-agent-chat-channels.command';
import { BackfillStandardApplicationDefaultRoleCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792741864752-backfill-standard-application-default-role.command';
import { MigrateRichTextToTiptapCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792748448862-migrate-rich-text-to-tiptap.command';
import { BackfillWorkspaceCustomApplicationDefaultRoleCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792755720300-backfill-workspace-custom-application-default-role.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ConnectedAccountMetadataModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    FileSettledAgentChatThreadsCommand,
    DeleteConnectedAccountsOutsideProviderScopeCommand,
    AddAgentChatChannelsCommand,
    BackfillStandardApplicationDefaultRoleCommand,
    MigrateRichTextToTiptapCommand,
    BackfillWorkspaceCustomApplicationDefaultRoleCommand,
  ],
})
export class V2_51_UpgradeVersionCommandModule {}
