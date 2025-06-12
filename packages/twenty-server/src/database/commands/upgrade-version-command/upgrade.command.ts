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
import { CleanNotFoundFilesCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-clean-not-found-files.command';
import { FixCreatedByDefaultValueCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-created-by-default-value.command';
import { FixStandardSelectFieldsPositionCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-fix-standard-select-fields-position.command';
import { LowercaseUserAndInvitationEmailsCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-lowercase-user-and-invitation-emails.command';
import { MigrateDefaultAvatarUrlToUserWorkspaceCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-migrate-default-avatar-url-to-user-workspace.command';
import { DeduplicateIndexedFieldsCommand } from 'src/database/commands/upgrade-version-command/0-55/0-55-deduplicate-indexed-fields.command';
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

  async shouldSkipUpgradeIfFreshInstallation(): Promise<boolean> {
    const activeWorkspaceOrSuspendedWorkspaceCount =
      await this.loadActiveOrSuspendedWorkspace();

    return activeWorkspaceOrSuspendedWorkspaceCount.length === 0;
  }

  async runMigrations(): Promise<void> {
    this.logger.log('Running global database migrations');

    try {
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

  public async areAllWorkspacesAboveVersion0_53(): Promise<boolean> {
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

    // 0.54 Commands
    protected readonly fixStandardSelectFieldsPositionCommand: FixStandardSelectFieldsPositionCommand,
    protected readonly fixCreatedByDefaultValueCommand: FixCreatedByDefaultValueCommand,
    protected readonly cleanNotFoundFilesCommand: CleanNotFoundFilesCommand,
    protected readonly lowercaseUserAndInvitationEmailsCommand: LowercaseUserAndInvitationEmailsCommand,
    protected readonly migrateDefaultAvatarUrlToUserWorkspaceCommand: MigrateDefaultAvatarUrlToUserWorkspaceCommand,

    // 0.55 Commands
    protected readonly deduplicateIndexedFieldsCommand: DeduplicateIndexedFieldsCommand,
  ) {
    super(
      workspaceRepository,
      twentyConfigService,
      twentyORMGlobalManager,
      syncWorkspaceMetadataCommand,
    );

    const commands_053: VersionCommands = {
      beforeSyncMetadata: [],
      afterSyncMetadata: [],
    };

    const commands_054: VersionCommands = {
      beforeSyncMetadata: [
        this.fixStandardSelectFieldsPositionCommand,
        this.fixCreatedByDefaultValueCommand,
      ],
      afterSyncMetadata: [
        this.cleanNotFoundFilesCommand,
        this.lowercaseUserAndInvitationEmailsCommand,
        this.migrateDefaultAvatarUrlToUserWorkspaceCommand,
      ],
    };

    const commands_055: VersionCommands = {
      beforeSyncMetadata: [this.deduplicateIndexedFieldsCommand],
      afterSyncMetadata: [],
    };

    this.allCommands = {
      '0.53.0': commands_053,
      '0.54.0': commands_054,
      '0.55.0': commands_055,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ): Promise<void> {
    const shouldSkipUpgradeIfFreshInstallation =
      await this.databaseMigrationService.shouldSkipUpgradeIfFreshInstallation();

    if (shouldSkipUpgradeIfFreshInstallation) {
      this.logger.log(
        chalk.blue('Fresh installation detected, skipping migration'),
      );

      return;
    }

    const shouldPreventFromUpgradingIfWorkspaceIsBelowVersion0_53 =
      !(await this.databaseMigrationService.areAllWorkspacesAboveVersion0_53());

    if (shouldPreventFromUpgradingIfWorkspaceIsBelowVersion0_53) {
      this.logger.log(
        chalk.red(
          'Not able to run migrate command, aborting the whole migrate-upgrade operation',
        ),
      );
      throw new Error('Could not run migration aborting');
    }

    await this.databaseMigrationService.runMigrations();

    await super.runMigrationCommand(passedParams, options);
  }
}
