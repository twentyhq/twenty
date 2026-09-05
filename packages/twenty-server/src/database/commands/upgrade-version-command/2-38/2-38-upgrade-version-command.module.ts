import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { NormalizeCompanyDomainNamesCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787935130000-normalize-company-domain-names.command';
import { AddBlocklistScopeFieldCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787933689056-add-blocklist-scope-field.command';
import { AddCalendarEventRelationsViewFieldCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787982276903-add-calendar-event-relations-view-field.command';
import { EnableEditLayoutAcrossAppCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787906715270-enable-edit-layout-across-app.command';
import { BackfillLinkedTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787914663665-backfill-linked-timeline-activity-happens-at.command';
import { ConfigureTimelineActivityHappensAtCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787918663365-configure-timeline-activity-happens-at.command';
import { PinAskAiCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1787938100000-pin-ask-ai-command-menu-item.command';
import { SyncMessageCampaignSchemaCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788200701000-sync-message-campaign-schema.command';
import { AlignMessageCampaignCommandsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788456317275-align-message-campaign-commands.command';
import { AddDuplicateMessageCampaignCommandCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788614900000-add-duplicate-message-campaign-command.command';
import { DropMessageDeliveryStatusCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788279414849-drop-message-delivery-status.command';
import { ReownObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788166853000-reown-object-navigation-command-menu-items.command';
import { ProvisionMissingObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788181550000-provision-missing-object-navigation-command-menu-items.command';
import { EnableStandardActivityTargetFieldsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788197000000-enable-standard-activity-target-fields.command';
import { SimplifyStandardTaskNoteLayoutsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788299312343-simplify-standard-task-note-layouts.command';
import { ProvisionMissingObjectSystemRelationsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788266912940-provision-missing-object-system-relations.command';
import { HideAskAiInSidePanelCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788266562942-hide-ask-ai-in-side-panel.command';
import { GateWorkflowVersionNavigationByCoreIndexFlagCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788340845000-gate-workflow-version-navigation-by-core-index-flag.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([CommandMenuItemEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    NormalizeCompanyDomainNamesCommand,
    AddBlocklistScopeFieldCommand,
    AddCalendarEventRelationsViewFieldCommand,
    EnableEditLayoutAcrossAppCommand,
    BackfillLinkedTimelineActivityHappensAtCommand,
    ConfigureTimelineActivityHappensAtCommand,
    PinAskAiCommandMenuItemCommand,
    SyncMessageCampaignSchemaCommand,
    AlignMessageCampaignCommandsCommand,
    AddDuplicateMessageCampaignCommandCommand,
    DropMessageDeliveryStatusCommand,
    ReownObjectNavigationCommandMenuItemsCommand,
    ProvisionMissingObjectNavigationCommandMenuItemsCommand,
    EnableStandardActivityTargetFieldsCommand,
    SimplifyStandardTaskNoteLayoutsCommand,
    ProvisionMissingObjectSystemRelationsCommand,
    HideAskAiInSidePanelCommand,
    GateWorkflowVersionNavigationByCoreIndexFlagCommand,
  ],
})
export class V2_38_UpgradeVersionCommandModule {}
