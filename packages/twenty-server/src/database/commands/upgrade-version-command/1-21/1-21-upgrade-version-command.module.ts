import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddComposeEmailCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-add-compose-email-command-menu-item.command';
import { MigrateMessagingInfrastructureToMetadataCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-migrate-messaging-infrastructure-to-metadata.command';
import { AddGlobalKeyValuePairUniqueIndexCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-add-global-key-value-pair-unique-index.command';
import { BackfillDatasourceToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-backfill-datasource-to-workspace.command';
import { BackfillMessageThreadSubjectCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-backfill-message-thread-subject.command';
import { BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-backfill-page-layouts-and-fields-widget-view-fields.command';
import { DeduplicateEngineCommandsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-deduplicate-engine-commands.command';
import { DropWorkspaceMessagingFksCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-drop-workspace-messaging-fks.command';
import { FixSelectAllCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-fix-select-all-command-menu-items.command';
import { MigrateAiAgentTextToJsonResponseFormatCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-migrate-ai-agent-text-to-json-response-format.command';
import { MigrateMessageFolderParentIdToExternalIdCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-migrate-message-folder-parent-id-to-external-id.command';
import { UpdateEditLayoutCommandMenuItemLabelCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-workspace-command-update-edit-layout-command-menu-item-label.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      DataSourceEntity,
      CalendarChannelEntity,
      ConnectedAccountEntity,
      MessageChannelEntity,
      MessageFolderEntity,
      UserWorkspaceEntity,
    ]),
    DataSourceModule,
    FieldMetadataModule,
    WorkspaceCacheModule,
    ApplicationModule,
    WorkspaceMigrationModule,
    FeatureFlagModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddComposeEmailCommandMenuItemCommand,
    AddGlobalKeyValuePairUniqueIndexCommand,
    BackfillDatasourceToWorkspaceCommand,
    BackfillMessageThreadSubjectCommand,
    BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    DeduplicateEngineCommandsCommand,
    FixSelectAllCommandMenuItemsCommand,
    MigrateAiAgentTextToJsonResponseFormatCommand,
    UpdateEditLayoutCommandMenuItemLabelCommand,
    DropWorkspaceMessagingFksCommand,
    MigrateMessageFolderParentIdToExternalIdCommand,
    MigrateMessagingInfrastructureToMetadataCommand,
  ],
  exports: [
    AddComposeEmailCommandMenuItemCommand,
    AddGlobalKeyValuePairUniqueIndexCommand,
    BackfillDatasourceToWorkspaceCommand,
    BackfillMessageThreadSubjectCommand,
    BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    DeduplicateEngineCommandsCommand,
    FixSelectAllCommandMenuItemsCommand,
    MigrateAiAgentTextToJsonResponseFormatCommand,
    UpdateEditLayoutCommandMenuItemLabelCommand,
    DropWorkspaceMessagingFksCommand,
    MigrateMessageFolderParentIdToExternalIdCommand,
    MigrateMessagingInfrastructureToMetadataCommand,
  ],
})
export class V1_21_UpgradeVersionCommandModule {}
