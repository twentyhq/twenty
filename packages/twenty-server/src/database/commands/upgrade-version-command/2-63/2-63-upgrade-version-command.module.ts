import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChannelAssociationAccountOwnerAndHandleCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795432675597-add-channel-association-account-owner-and-handle.command';
import { AddChannelTargetRelatedRecordPathsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795449569000-add-channel-target-related-record-paths.command';
import { AddRichTextFileIdsColumnsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795470090382-add-rich-text-file-ids-columns.command';
import { AddAiChatParticipantsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795508846990-add-ai-chat-participants-command-menu-item.command';
import { AddCallRecordingRelatedRecordPathCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795517101008-add-call-recording-related-record-path.command';
import { CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795522445881-copy-page-layout-widget-rules-to-conditional-availability.command';
import { AddStandardInboxViewsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795526879491-add-standard-inbox-views.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddChannelAssociationAccountOwnerAndHandleCommand,
    AddChannelTargetRelatedRecordPathsCommand,
    AddRichTextFileIdsColumnsCommand,
    AddAiChatParticipantsCommandMenuItemCommand,
    AddCallRecordingRelatedRecordPathCommand,
    CopyPageLayoutWidgetRulesToConditionalAvailabilityCommand,
    AddStandardInboxViewsCommand,
  ],
})
export class V2_63_UpgradeVersionCommandModule {}
