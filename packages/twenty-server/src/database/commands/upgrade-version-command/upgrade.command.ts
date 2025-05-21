import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { exec } from 'child_process';
import { promisify } from 'util';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

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
import { compareVersionMajorAndMinor } from 'src/utils/version/compare-version-minor-and-major';

const execPromise = promisify(exec);

@Injectable()
export class DatabaseMigrationService {
  private logger = new Logger(DatabaseMigrationService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  // TODO centralize with ActiveOrSuspendedRunner method
  private async loadActiveOrSuspendedWorkspace() {
    return await this.workspaceRepository.find({
      select: ['id', 'version'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async shouldRunMigrationsIfAllWorkspaceAreAboveVersion0_53(): Promise<boolean> {
    const coreWorkspaceSchemaExists = await this.checkCoreWorkspaceExists();

    if (!coreWorkspaceSchemaExists) {
      this.logger.log(
        'core.workspace does not exist. Running migrations for fresh installation.',
      );

      return true;
    }

    this.logger.log('Not a first installation, checking workspace versions...');

    return await this.areAllWorkspacesAboveVersion0_53();
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

  private async checkCoreWorkspaceExists(): Promise<boolean> {
    try {
      const result = await this.workspaceRepository.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'core' 
          AND table_name = 'workspace'
        );
      `);

      return result[0].exists;
    } catch (error) {
      this.logger.error('Error checking core.workspace existence:', error);

      return false;
    }
  }

  private async areAllWorkspacesAboveVersion0_53(): Promise<boolean> {
    try {
      const allActiveOrSuspendedWorkspaces =
        await this.loadActiveOrSuspendedWorkspace();

      if (allActiveOrSuspendedWorkspaces.length === 0) {
        this.logger.log(
          'No workspaces found. Running migrations for fresh installation.',
        );

        return true;
      }

      const workspacesBelowVersion = allActiveOrSuspendedWorkspaces.filter(
        ({ version }) =>
          version === null ||
          compareVersionMajorAndMinor(version, '0.53.0') === 'lower',
      );

      this.logger.log(
        `Found ${workspacesBelowVersion.length} active or suspended workspaces that are below version 0.53.0 \n${workspacesBelowVersion.map((el) => el.id).join('\n')}`,
      );

      return workspacesBelowVersion.length === 0;
    } catch (error) {
      this.logger.error('Error checking workspaces below version:', error);
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
    const shouldRunMigrateAsPartOfUpgrade =
      await this.databaseMigrationService.shouldRunMigrationsIfAllWorkspaceAreAboveVersion0_53();

    if (!shouldRunMigrateAsPartOfUpgrade) {
      this.logger.log(
        chalk.red(
          'Not able to run migrate command, aborting the whole migrate-upgrade operation',
        ),
      );
      throw new Error('Could not run migration aborting');
    }

    await super.runMigrationCommand(passedParams, options);
  }
}
