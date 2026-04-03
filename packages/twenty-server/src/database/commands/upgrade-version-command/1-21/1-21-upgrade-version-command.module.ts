import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddGlobalKeyValuePairUniqueIndexCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-add-global-key-value-pair-unique-index.command';
import { BackfillDatasourceToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-datasource-to-workspace.command';
import { BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-backfill-page-layouts-and-fields-widget-view-fields.command';
import { DeduplicateEngineCommandsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-deduplicate-engine-commands.command';
import { DropWorkspaceMessagingFksCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-drop-workspace-messaging-fks.command';
import { FixSelectAllCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-fix-select-all-command-menu-items.command';
import { MigrateAiAgentTextToJsonResponseFormatCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-migrate-ai-agent-text-to-json-response-format.command';
import { UpdateEditLayoutCommandMenuItemLabelCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-update-edit-layout-command-menu-item-label.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, DataSourceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    ApplicationModule,
    WorkspaceMigrationModule,
    FeatureFlagModule,
    WorkspaceIteratorModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddGlobalKeyValuePairUniqueIndexCommand,
    BackfillDatasourceToWorkspaceCommand,
    BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    DeduplicateEngineCommandsCommand,
    FixSelectAllCommandMenuItemsCommand,
    MigrateAiAgentTextToJsonResponseFormatCommand,
    UpdateEditLayoutCommandMenuItemLabelCommand,
    DropWorkspaceMessagingFksCommand,
  ],
  exports: [
    AddGlobalKeyValuePairUniqueIndexCommand,
    BackfillDatasourceToWorkspaceCommand,
    BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    DeduplicateEngineCommandsCommand,
    FixSelectAllCommandMenuItemsCommand,
    MigrateAiAgentTextToJsonResponseFormatCommand,
    UpdateEditLayoutCommandMenuItemLabelCommand,
    DropWorkspaceMessagingFksCommand,
  ],
})
export class V1_21_UpgradeVersionCommandModule {}
