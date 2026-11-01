import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CountMessageListMembersCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791977057418-count-message-list-members.command';
import { RemoveCampaignListStatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791979361903-remove-campaign-list-stat-columns.command';
import { AddCampaignListViewCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791979361904-add-campaign-list-view.command';
import { RenameDevelopersSettingsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791988325586-rename-developers-settings-command-menu-item.command';
import { BackfillMorphRelationHeadsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791998420300-backfill-morph-relation-heads.command';
import { RemoveWorkflowRunIndexWorkflowVersionColumnCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792051845780-remove-workflow-run-index-workflow-version-column.command';
import { SyncCampaignComposerStandardMetadataCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792064982496-sync-campaign-composer-standard-metadata.command';
import { FlushWorkflowAutomatedTriggerMapsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792068879353-flush-workflow-automated-trigger-maps.command';
import { CopyMorphRelationReferencesToHeadsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792070263989-copy-morph-relation-references-to-heads.command';
import { AddAgentMessageReactionObjectCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1792072097024-add-agent-message-reaction-object.command';
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
    CountMessageListMembersCommand,
    RemoveCampaignListStatColumnsCommand,
    AddCampaignListViewCommand,
    RenameDevelopersSettingsCommandMenuItemCommand,
    BackfillMorphRelationHeadsCommand,
    RemoveWorkflowRunIndexWorkflowVersionColumnCommand,
    SyncCampaignComposerStandardMetadataCommand,
    FlushWorkflowAutomatedTriggerMapsCommand,
    CopyMorphRelationReferencesToHeadsCommand,
    AddAgentMessageReactionObjectCommand,
  ],
})
export class V2_48_UpgradeVersionCommandModule {}
