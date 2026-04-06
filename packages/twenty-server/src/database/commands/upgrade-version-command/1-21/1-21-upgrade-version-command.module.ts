import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddComposeEmailCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-add-compose-email-command-menu-item.command';
import { AddGlobalKeyValuePairUniqueIndexCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-add-global-key-value-pair-unique-index.command';
import { BackfillDatasourceToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-datasource-to-workspace.command';
import { BackfillMessageThreadSubjectCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-message-thread-subject.command';
import { BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-page-layouts-and-fields-widget-view-fields.command';
import { DeduplicateEngineCommandsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-deduplicate-engine-commands.command';
import { DropWorkspaceMessagingFksCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-drop-workspace-messaging-fks.command';
import { FixSelectAllCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-fix-select-all-command-menu-items.command';
import { AddGlobalKeyValuePairUniqueIndex1774700000000 } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1774700000000-add-global-key-value-pair-unique-index';
import { AddIsActiveToOverridableEntities1774966727625 } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1774966727625-addIsActiveToOverridableEntities';
import { AddStatusToAgentMessage1775001600000 } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775001600000-add-status-to-agent-message';
import { AddViewFieldGroupIdIndexOnViewField1775129420309 } from 'src/database/commands/upgrade-version-command/1-21/1-21-instance-command-fast-1775129420309-add-view-field-group-id-index-on-view-field';
import { MigrateAiAgentTextToJsonResponseFormatCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-migrate-ai-agent-text-to-json-response-format.command';
import { MigrateMessageFolderParentIdToExternalIdCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-migrate-message-folder-parent-id-to-external-id.command';
import { UpdateEditLayoutCommandMenuItemLabelCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-update-edit-layout-command-menu-item-label.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      DataSourceEntity,
      MessageFolderEntity,
    ]),
    DataSourceModule,
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
    AddGlobalKeyValuePairUniqueIndex1774700000000,
    AddIsActiveToOverridableEntities1774966727625,
    AddStatusToAgentMessage1775001600000,
    AddViewFieldGroupIdIndexOnViewField1775129420309,
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
  ],
})
export class V1_21_UpgradeVersionCommandModule {}
