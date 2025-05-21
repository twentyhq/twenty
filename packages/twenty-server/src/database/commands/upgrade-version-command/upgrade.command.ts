import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { exec } from 'child_process';
import { promisify } from 'util';

import { Command } from 'nest-commander';
import { Like, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandOptions } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import {
  AllCommands,
  UpgradeCommandRunner,
  VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateIsSearchableForCustomObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-is-searchable-for-custom-object-metadata.command';
import { MigrateRichTextContentPatchCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-rich-text-content-patch.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { InitializePermissionsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-initialize-permissions.command';
import { UpdateViewAggregateOperationsCommand } from 'src/database/commands/upgrade-version-command/0-44/0-44-update-view-aggregate-operations.command';
import { UpgradeCreatedByEnumCommand } from 'src/database/commands/upgrade-version-command/0-51/0-51-update-workflow-trigger-type-enum.command';
import { MigrateRelationsToFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-migrate-relations-to-field-metadata.command';
import { UpgradeDateAndDateTimeFieldsSettingsJsonCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-upgrade-settings-field';
import { BackfillWorkflowNextStepIdsCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-backfill-workflow-next-step-ids.command';
import { CopyTypeormMigrationsCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-copy-typeorm-migrations.command';
import { MigrateWorkflowEventListenersToAutomatedTriggersCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-migrate-workflow-event-listeners-to-automated-triggers.command';
import { RemoveRelationForeignKeyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-remove-relation-foreign-key-field-metadata.command';
import { UpgradeSearchVectorOnPersonEntityCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-upgrade-search-vector-on-person-entity.command';
import { FixCreatedByDefaultValueCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-created-by-default-value.command';
import { FixStandardSelectFieldsPositionCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-fix-standard-select-fields-position.command';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

const execPromise = promisify(exec);

@Injectable()
export class DatabaseMigrationService {
  private logger = new console.Console(process.stdout, process.stderr);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async shouldRunMigrations(): Promise<boolean> {
    try {
      // Check if any workspace exists
      const workspaceCount = await this.workspaceRepository.count();

      if (workspaceCount === 0) {
        // If no workspaces, run migrations (fresh installation)
        this.logger.log(
          'No workspaces found. Running migrations for fresh installation.',
        );

        return true;
      }

      const version053Count = await this.workspaceRepository.count({
        where: {
          version: Like('0.53%'),
        },
      });

      if (version053Count > 0) {
        this.logger.log(
          `Found ${version053Count} workspace(s) on version 0.53. Will run database migrations.`,
        );

        return true;
      } else {
        this.logger.log(
          'No workspace found on version 0.53. Skipping database migrations.',
        );

        return false;
      }
    } catch (error) {
      this.logger.error('Error checking workspace versions:', error);

      // Default to running migrations in case of error
      return true;
    }
  }

  async runMigrations(): Promise<void> {
    this.logger.log('Running global database migrations');

    try {
      this.logger.log('Running metadata datasource migrations...');
      const metadataResult = await execPromise(
        'npx -y typeorm migration:run -d dist/src/database/typeorm/metadata/metadata.datasource',
      );

      this.logger.log(metadataResult.stdout);

      this.logger.log('Running core datasource migrations...');
      const coreResult = await execPromise(
        'npx -y typeorm migration:run -d dist/src/database/typeorm/core/core.datasource',
      );

      this.logger.log(coreResult.stdout);

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Error running database migrations:', error);
      throw error;
    }
  }
}

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends UpgradeCommandRunner {
  override allCommands: AllCommands;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,

    private readonly databaseMigrationService: DatabaseMigrationService,

    // 0.43 Commands
    protected readonly migrateRichTextContentPatchCommand: MigrateRichTextContentPatchCommand,
    protected readonly addTasksAssignedToMeViewCommand: AddTasksAssignedToMeViewCommand,
    protected readonly migrateIsSearchableForCustomObjectMetadataCommand: MigrateIsSearchableForCustomObjectMetadataCommand,
    protected readonly updateDefaultViewRecordOpeningOnWorkflowObjectsCommand: UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    protected readonly migrateSearchVectorOnNoteAndTaskEntitiesCommand: MigrateSearchVectorOnNoteAndTaskEntitiesCommand,

    // 0.44 Commands
    protected readonly initializePermissionsCommand: InitializePermissionsCommand,
    protected readonly updateViewAggregateOperationsCommand: UpdateViewAggregateOperationsCommand,

    // 0.51 Commands
    protected readonly upgradeCreatedByEnumCommand: UpgradeCreatedByEnumCommand,

    // 0.52 Commands
    protected readonly upgradeDateAndDateTimeFieldsSettingsJsonCommand: UpgradeDateAndDateTimeFieldsSettingsJsonCommand,
    protected readonly migrateRelationsToFieldMetadataCommand: MigrateRelationsToFieldMetadataCommand,

    // 0.53 Commands
    protected readonly migrateWorkflowEventListenersToAutomatedTriggersCommand: MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    protected readonly backfillWorkflowNextStepIdsCommand: BackfillWorkflowNextStepIdsCommand,
    protected readonly copyTypeormMigrationsCommand: CopyTypeormMigrationsCommand,
    protected readonly upgradeSearchVectorOnPersonEntityCommand: UpgradeSearchVectorOnPersonEntityCommand,
    protected readonly removeRelationForeignKeyFieldMetadataCommand: RemoveRelationForeignKeyFieldMetadataCommand,

    // 0.54 Commands
    protected readonly fixStandardSelectFieldsPositionCommand: FixStandardSelectFieldsPositionCommand,
    protected readonly fixCreatedByDefaultValueCommand: FixCreatedByDefaultValueCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      twentyORMGlobalManager,
      syncWorkspaceMetadataCommand,
    );

    const commands_043: VersionCommands = {
      beforeSyncMetadata: [
        this.migrateRichTextContentPatchCommand,
        this.migrateIsSearchableForCustomObjectMetadataCommand,
        this.migrateSearchVectorOnNoteAndTaskEntitiesCommand,
        this.migrateIsSearchableForCustomObjectMetadataCommand,
      ],
      afterSyncMetadata: [
        this.updateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
        this.addTasksAssignedToMeViewCommand,
      ],
    };
    const commands_044: VersionCommands = {
      beforeSyncMetadata: [
        this.initializePermissionsCommand,
        this.updateViewAggregateOperationsCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_050: VersionCommands = {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    };

    const commands_051: VersionCommands = {
      beforeSyncMetadata: [this.upgradeCreatedByEnumCommand],
      afterSyncMetadata: [],
    };

    const commands_052: VersionCommands = {
      beforeSyncMetadata: [
        this.upgradeDateAndDateTimeFieldsSettingsJsonCommand,
        this.migrateRelationsToFieldMetadataCommand,
      ],
      afterSyncMetadata: [],
    };

    const commands_053: VersionCommands = {
      beforeSyncMetadata: [this.removeRelationForeignKeyFieldMetadataCommand],
      afterSyncMetadata: [
        this.migrateWorkflowEventListenersToAutomatedTriggersCommand,
        this.backfillWorkflowNextStepIdsCommand,
        this.copyTypeormMigrationsCommand,
        this.upgradeSearchVectorOnPersonEntityCommand,
      ],
    };

    const commands_054: VersionCommands = {
      beforeSyncMetadata: [
        this.fixStandardSelectFieldsPositionCommand,
        this.fixCreatedByDefaultValueCommand,
      ],
      afterSyncMetadata: [],
    };

    this.allCommands = {
      '0.43.0': commands_043,
      '0.44.0': commands_044,
      '0.50.0': commands_050,
      '0.51.0': commands_051,
      '0.52.0': commands_052,
      '0.53.0': commands_053,
      '0.54.0': commands_054,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    // Only run migrations if we have at least one workspace on version 0.53
    const shouldRunMigrations =
      await this.databaseMigrationService.shouldRunMigrations();

    if (shouldRunMigrations) {
      await this.databaseMigrationService.runMigrations();
    } else {
      this.logger.log(
        'Skipping database migrations as no workspace is on version 0.53.',
      );
    }

    // Continue with the regular upgrade process
    await super.runMigrationCommand(passedParams, options);
  }
}
