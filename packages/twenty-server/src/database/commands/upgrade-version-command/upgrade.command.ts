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
import { SeedDashboardViewCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-seed-dashboard-view.command';
import { FixLabelIdentifierPositionAndVisibilityCommand } from 'src/database/commands/upgrade-version-command/1-6/1-6-fix-label-identifier-position-and-visibility.command';
import { BackfillWorkflowManualTriggerAvailabilityCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-backfill-workflow-manual-trigger-availability.command';
import { DeduplicateUniqueFieldsCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-deduplicate-unique-fields.command';
import { FillNullServerlessFunctionLayerIdCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-fill-null-serverless-function-layer-id.command';
import { MigrateChannelSyncStagesCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-channel-sync-stages.command';
import { MigrateWorkflowStepFilterOperandValueCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-workflow-step-filter-operand-value';
import { RegeneratePersonSearchVectorWithPhonesCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-regenerate-person-search-vector-with-phones.command';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
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
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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
    protected readonly seedDashboardViewCommand: SeedDashboardViewCommand,
    protected readonly createViewKanbanFieldMetadataIdForeignKeyMigrationCommand: CreateViewKanbanFieldMetadataIdForeignKeyMigrationCommand,
    protected readonly flushWorkspaceCacheCommand: FlushCacheCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      twentyORMGlobalManager,
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
        this.seedDashboardViewCommand,
        this.flushWorkspaceCacheCommand,
      ],
    };

    this.allCommands = {
      '1.6.0': commands_160,
      '1.7.0': commands_170,
      '1.8.0': commands_180,
      '1.10.0': commands_1100,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    return await super.runMigrationCommand(passedParams, options);
  }
}
