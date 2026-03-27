import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-command-menu-items.command';
import { BackfillNavigationMenuItemTypeCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-navigation-menu-item-type.command';
import { BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-page-layouts-and-fields-widget-view-fields.command';
import { BackfillSelectFieldOptionIdsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-backfill-select-field-option-ids.command';
import { DeleteOrphanNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-delete-orphan-navigation-menu-items.command';
import { IdentifyObjectPermissionMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-identify-object-permission-metadata.command';
import { IdentifyPermissionFlagMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-identify-permission-flag-metadata.command';
import { MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-make-object-permission-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-make-permission-flag-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeWorkflowSearchableCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-make-workflow-searchable.command';
import { MigrateMessagingInfrastructureToMetadataCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-migrate-messaging-infrastructure-to-metadata.command';
import { MigrateRichTextToTextCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-migrate-rich-text-to-text.command';
import { SeedCliApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-seed-cli-application-registration.command';
import { UpdateStandardIndexViewNamesCommand } from 'src/database/commands/upgrade-version-command/1-20/1-20-update-standard-index-view-names.command';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ConnectedAccountEntity,
      MessageChannelEntity,
      CalendarChannelEntity,
      MessageFolderEntity,
      UserWorkspaceEntity,
      NavigationMenuItemEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationRunnerModule,
    ApplicationModule,
    ApplicationRegistrationModule,
    WorkspaceMigrationModule,
    FeatureFlagModule,
    WorkflowCommonModule,
  ],
  providers: [
    IdentifyPermissionFlagMetadataCommand,
    MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    IdentifyObjectPermissionMetadataCommand,
    MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    BackfillCommandMenuItemsCommand,
    BackfillNavigationMenuItemTypeCommand,
    BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    BackfillSelectFieldOptionIdsCommand,
    DeleteOrphanNavigationMenuItemsCommand,
    SeedCliApplicationRegistrationCommand,
    MigrateRichTextToTextCommand,
    MigrateMessagingInfrastructureToMetadataCommand,
    UpdateStandardIndexViewNamesCommand,
    MakeWorkflowSearchableCommand,
  ],
  exports: [
    IdentifyPermissionFlagMetadataCommand,
    MakePermissionFlagUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    IdentifyObjectPermissionMetadataCommand,
    MakeObjectPermissionUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    BackfillCommandMenuItemsCommand,
    BackfillNavigationMenuItemTypeCommand,
    BackfillPageLayoutsAndFieldsWidgetViewFieldsCommand,
    BackfillSelectFieldOptionIdsCommand,
    DeleteOrphanNavigationMenuItemsCommand,
    SeedCliApplicationRegistrationCommand,
    MigrateRichTextToTextCommand,
    MigrateMessagingInfrastructureToMetadataCommand,
    UpdateStandardIndexViewNamesCommand,
    MakeWorkflowSearchableCommand,
  ],
})
export class V1_20_UpgradeVersionCommandModule {}
