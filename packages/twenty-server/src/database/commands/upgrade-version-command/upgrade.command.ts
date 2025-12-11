import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { type ActiveOrSuspendedWorkspacesMigrationCommandOptions } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  type AllCommands,
  UpgradeCommandRunner,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { AddWorkflowRunStopStatusesCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-add-workflow-run-stop-statuses.command';
import { CleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-clean-orphaned-kanban-aggregate-operation-field-metadata-id.command';
import { CreateViewKanbanFieldMetadataIdForeignKeyMigrationCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-create-view-kanban-field-metadata-id-foreign-key-migration.command';
import { FlushCacheCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-flush-cache.command';
import { MakeSureDashboardNamingAvailableCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-make-sure-dashboard-naming-available.command';
import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-attachment-author-to-created-by.command';
import { MigrateAttachmentTypeToFileCategoryCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-attachment-type-to-file-category.command';
import { MigrateChannelPartialFullSyncStagesCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-channel-partial-full-sync-stages.command';
import { RegenerateSearchVectorsCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-regenerate-search-vectors.command';
import { CleanOrphanedRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-clean-orphaned-role-targets.command';
import { CleanOrphanedUserWorkspacesCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-clean-orphaned-user-workspaces.command';
import { CreateTwentyStandardApplicationCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-create-twenty-standard-application.command';
import { AddCalendarEventsImportScheduledSyncStageCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-add-calendar-events-import-scheduled-sync-stage.command';
import { AddMessagesImportScheduledSyncStageCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-add-messages-import-scheduled-sync-stage.command';
import { CleanNullEquivalentValuesCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-clean-null-equivalent-values';
import { CreateWorkspaceCustomApplicationCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-create-workspace-custom-application.command';
import { SetStandardApplicationNotUninstallableCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-set-standard-application-not-uninstallable.command';
import { WorkspaceCustomApplicationIdNonNullableCommand } from 'src/database/commands/upgrade-version-command/1-12/1-12-workspace-custom-application-id-non-nullable-migration.command';
import { BackfillPageLayoutUniversalIdentifiersCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-backfill-page-layout-universal-identifiers.command';
import { DeduplicateRoleTargetsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-deduplicate-role-targets.command';
import { MigrateStandardInvalidEntitiesCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-standard-invalid-entities.command';
import { MigrateTimelineActivityToMorphRelationsCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-migrate-timeline-activity-to-morph-relations.command';
import { UpdateRoleTargetsUniqueConstraintMigrationCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-update-role-targets-unique-constraint-migration.command';
import { FixLabelIdentifierPositionAndVisibilityCommand } from 'src/database/commands/upgrade-version-command/1-6/1-6-fix-label-identifier-position-and-visibility.command';
import { BackfillWorkflowManualTriggerAvailabilityCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-backfill-workflow-manual-trigger-availability.command';
import { DeduplicateUniqueFieldsCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-deduplicate-unique-fields.command';
import { FillNullServerlessFunctionLayerIdCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-fill-null-serverless-function-layer-id.command';
import { MigrateChannelSyncStagesCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-channel-sync-stages.command';
import { MigrateWorkflowStepFilterOperandValueCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-workflow-step-filter-operand-value';
import { RegeneratePersonSearchVectorWithPhonesCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-regenerate-person-search-vector-with-phones.command';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends UpgradeCommandRunner {
  override allCommands: AllCommands;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,

    // 1.6 Commands
    protected readonly fixLabelIdentifierPositionAndVisibilityCommand: FixLabelIdentifierPositionAndVisibilityCommand,

    // 1.7 Commands
    protected readonly backfillWorkflowManualTriggerAvailabilityCommand: BackfillWorkflowManualTriggerAvailabilityCommand,

    // 1.8 Commands
    protected readonly fillNullServerlessFunctionLayerIdCommand: FillNullServerlessFunctionLayerIdCommand,
    protected readonly migrateWorkflowStepFilterOperandValueCommand: MigrateWorkflowStepFilterOperandValueCommand,
    protected readonly deduplicateUniqueFieldsCommand: DeduplicateUniqueFieldsCommand,
    protected readonly regeneratePersonSearchVectorWithPhonesCommand: RegeneratePersonSearchVectorWithPhonesCommand,
    protected readonly migrateChannelSyncStagesCommand: MigrateChannelSyncStagesCommand,

    // 1.10 Commands
    protected readonly migrateAttachmentAuthorToCreatedByCommand: MigrateAttachmentAuthorToCreatedByCommand,
    protected readonly migrateAttachmentTypeToFileCategoryCommand: MigrateAttachmentTypeToFileCategoryCommand,
    protected readonly regenerateSearchVectorsCommand: RegenerateSearchVectorsCommand,
    protected readonly addWorkflowRunStopStatusesCommand: AddWorkflowRunStopStatusesCommand,
    protected readonly cleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand: CleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand,
    protected readonly migrateChannelPartialFullSyncStagesCommand: MigrateChannelPartialFullSyncStagesCommand,
    protected readonly makeSureDashboardNamingAvailableCommand: MakeSureDashboardNamingAvailableCommand,
    protected readonly createViewKanbanFieldMetadataIdForeignKeyMigrationCommand: CreateViewKanbanFieldMetadataIdForeignKeyMigrationCommand,
    protected readonly flushWorkspaceCacheCommand: FlushCacheCommand,

    // 1.11 Commands
    protected readonly cleanOrphanedUserWorkspacesCommand: CleanOrphanedUserWorkspacesCommand,
    protected readonly cleanOrphanedRoleTargetsCommand: CleanOrphanedRoleTargetsCommand,
    protected readonly seedStandardApplicationsCommand: CreateTwentyStandardApplicationCommand,

    // 1.12 Commands
    protected readonly setStandardApplicationNotUninstallableCommand: SetStandardApplicationNotUninstallableCommand,
    protected readonly createTwentyStandardApplicationCommand: CreateTwentyStandardApplicationCommand,
    protected readonly createWorkspaceCustomApplicationCommand: CreateWorkspaceCustomApplicationCommand,
    protected readonly workspaceCustomApplicationIdNonNullableCommand: WorkspaceCustomApplicationIdNonNullableCommand,
    protected readonly addMessagesImportScheduledSyncStageCommand: AddMessagesImportScheduledSyncStageCommand,
    protected readonly addCalendarEventsImportScheduledSyncStageCommand: AddCalendarEventsImportScheduledSyncStageCommand,
    protected readonly cleanNullEquivalentValuesCommand: CleanNullEquivalentValuesCommand,

    // 1.13 Commands
    protected readonly migrateTimelineActivityToMorphRelationsCommand: MigrateTimelineActivityToMorphRelationsCommand,
    protected readonly deduplicateRoleTargetsCommand: DeduplicateRoleTargetsCommand,
    protected readonly updateRoleTargetsUniqueConstraintMigrationCommand: UpdateRoleTargetsUniqueConstraintMigrationCommand,
    protected readonly backfillPageLayoutUniversalIdentifiersCommand: BackfillPageLayoutUniversalIdentifiersCommand,
    protected readonly migrateStandardInvalidEntitiesCommand: MigrateStandardInvalidEntitiesCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      globalWorkspaceOrmManager,
      dataSourceService,
      syncWorkspaceMetadataCommand,
    );

    const commands_160: VersionCommands = {
      beforeSyncMetadata: [this.fixLabelIdentifierPositionAndVisibilityCommand],
      afterSyncMetadata: [],
    };

    const commands_170: VersionCommands = {
      beforeSyncMetadata: [
        this.backfillWorkflowManualTriggerAvailabilityCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_180: VersionCommands = {
      beforeSyncMetadata: [
        this.migrateWorkflowStepFilterOperandValueCommand,
        this.deduplicateUniqueFieldsCommand,
        this.regeneratePersonSearchVectorWithPhonesCommand,
        this.migrateChannelSyncStagesCommand,
        this.fillNullServerlessFunctionLayerIdCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_1100: VersionCommands = {
      beforeSyncMetadata: [
        this.regenerateSearchVectorsCommand,
        this.addWorkflowRunStopStatusesCommand,
        this.cleanOrphanedKanbanAggregateOperationFieldMetadataIdCommand,
        this.createViewKanbanFieldMetadataIdForeignKeyMigrationCommand,
        this.migrateChannelPartialFullSyncStagesCommand,
        this.makeSureDashboardNamingAvailableCommand,
      ],
      afterSyncMetadata: [
        this.migrateAttachmentAuthorToCreatedByCommand,
        this.migrateAttachmentTypeToFileCategoryCommand,
        this.flushWorkspaceCacheCommand,
      ],
    };

    const commands_1110: VersionCommands = {
      beforeSyncMetadata: [this.createTwentyStandardApplicationCommand],
      afterSyncMetadata: [
        this.cleanOrphanedUserWorkspacesCommand,
        this.cleanOrphanedRoleTargetsCommand,
      ],
    };

    const commands_1120: VersionCommands = {
      beforeSyncMetadata: [
        this.createWorkspaceCustomApplicationCommand,
        this.workspaceCustomApplicationIdNonNullableCommand,
        this.addMessagesImportScheduledSyncStageCommand,
        this.addCalendarEventsImportScheduledSyncStageCommand,
        this.cleanNullEquivalentValuesCommand,
      ],
      afterSyncMetadata: [this.setStandardApplicationNotUninstallableCommand],
    };

    const commands_1130: VersionCommands = {
      beforeSyncMetadata: [
        this.deduplicateRoleTargetsCommand,
        this.updateRoleTargetsUniqueConstraintMigrationCommand,
        this.migrateTimelineActivityToMorphRelationsCommand,
        this.backfillPageLayoutUniversalIdentifiersCommand,
        this.migrateStandardInvalidEntitiesCommand,
      ],
      afterSyncMetadata: [],
    };

    this.allCommands = {
      '1.6.0': commands_160,
      '1.7.0': commands_170,
      '1.8.0': commands_180,
      '1.10.0': commands_1100,
      '1.11.0': commands_1110,
      '1.12.0': commands_1120,
      '1.13.0': commands_1130,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
