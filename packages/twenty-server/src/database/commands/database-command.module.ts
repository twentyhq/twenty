import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronRegisterAllCommand } from 'src/database/commands/cron-register-all.command';
import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { ListOrphanedWorkspaceEntitiesCommand } from 'src/database/commands/list-and-delete-orphaned-workspace-entities.command';
import { ConfirmationQuestion } from 'src/database/commands/questions/confirmation.question';
import { WorkspaceExportModule } from 'src/database/commands/workspace-export/workspace-export.module';
import { UpgradeVersionCommandModule } from 'src/database/commands/upgrade-version-command/upgrade-version-command.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { GenerateApiKeyCommand } from 'src/engine/core-modules/api-key/commands/generate-api-key.command';
import { MarketplaceModule } from 'src/engine/core-modules/application/application-marketplace/marketplace.module';
import { StaleRegistrationCleanupModule } from 'src/engine/core-modules/application/application-oauth/stale-registration-cleanup/stale-registration-cleanup.module';
import { ApplicationUpgradeModule } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.module';
import { EnterpriseKeyValidationCronCommand } from 'src/engine/core-modules/enterprise/cron/command/enterprise-key-validation.cron.command';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { EventLogCleanupModule } from 'src/engine/core-modules/event-logs/cleanup/event-log-cleanup.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { PublicDomainModule } from 'src/engine/core-modules/public-domain/public-domain.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
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
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceExportModule,
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
    EnterpriseModule,
    TwentyConfigModule,
    MarketplaceModule,
    ApplicationUpgradeModule,
    StaleRegistrationCleanupModule,
  ],
  providers: [
    DataSeedWorkspaceCommand,
    ConfirmationQuestion,
    CronRegisterAllCommand,
    ListOrphanedWorkspaceEntitiesCommand,
    EnterpriseKeyValidationCronCommand,
    GenerateApiKeyCommand,
  ],
})
export class DatabaseCommandModule {}
