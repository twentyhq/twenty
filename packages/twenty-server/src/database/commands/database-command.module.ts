import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronRegisterAllCommand } from 'src/database/commands/cron-register-all.command';
import { ProvisionGoogleWorkspaceAccountsCommand } from 'src/database/commands/custom/provision-google-workspace-accounts.command';
import { SeedInsuranceNavigationCommand } from 'src/database/commands/custom/seed-insurance-navigation.command';
import { SyncPolicyStatusFromCsvCommand } from 'src/database/commands/custom/sync-policy-status-from-csv.command';
import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { ListOrphanedWorkspaceEntitiesCommand } from 'src/database/commands/list-and-delete-orphaned-workspace-entities.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { SyncAgentWorkspaceMembersCommand } from 'src/database/commands/sync-agent-workspace-members.command';
import { UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/upgrade-version-command.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { GenerateApiKeyCommand } from 'src/engine/core-modules/api-key/commands/generate-api-key.command';
import { EventLogCleanupModule } from 'src/engine/core-modules/event-logs/cleanup/event-log-cleanup.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { PublicDomainModule } from 'src/engine/core-modules/public-domain/public-domain.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TrashCleanupModule } from 'src/engine/trash-cleanup/trash-cleanup.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { DevSeederModule } from 'src/engine/workspace-manager/dev-seeder/dev-seeder.module';
import { WorkspaceCleanerModule } from 'src/engine/workspace-manager/workspace-cleaner/workspace-cleaner.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { CalendarEventImportManagerModule } from 'src/modules/calendar/calendar-event-import-manager/calendar-event-import-manager.module';
import { MessagingImportManagerModule } from 'src/modules/messaging/message-import-manager/messaging-import-manager.module';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';
import { AutomatedTriggerModule } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.module';

@Module({
  imports: [
    UpgradeVersionCommandModule,
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      NavigationMenuItemEntity,
      ViewEntity,
    ]),
    // Cron command dependencies
    MessagingImportManagerModule,
    CalendarEventImportManagerModule,
    AutomatedTriggerModule,
    FileModule,
    WorkspaceModule,
    WorkflowRunQueueModule,
    // Data seeding dependencies
    TypeORMModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    DevSeederModule,
    WorkspaceManagerModule,
    DataSourceModule,
    WorkspaceCacheStorageModule,
    ApiKeyModule,
    FeatureFlagModule,
    WorkspaceCleanerModule,
    WorkspaceMigrationModule,
    TrashCleanupModule,
    PublicDomainModule,
    EventLogCleanupModule,
    ApplicationModule,
    WorkspaceCacheModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    ConfirmationQuestion,
    CronRegisterAllCommand,
    ListOrphanedWorkspaceEntitiesCommand,
    SyncAgentWorkspaceMembersCommand,
    SeedInsuranceNavigationCommand,
    ProvisionGoogleWorkspaceAccountsCommand,
    SyncPolicyStatusFromCsvCommand,
    GenerateApiKeyCommand,
  ],
})
export class DatabaseCommandModule {}
