import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { TWENTY_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

type RunInstanceCommandsOptions = {
  force?: boolean;
  includeSlow?: boolean;
};

// TODO should be replaced by a specific call to the upgrade
@Command({
  name: 'run-instance-commands',
  description:
    'Run legacy TypeORM migrations and all registered instance commands',
})
export class RunInstanceCommandsCommand extends CommandRunner {
  private readonly logger = new Logger(RunInstanceCommandsCommand.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly workspaceVersionService: WorkspaceVersionService,
    private readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly instanceUpgradeService: InstanceCommandRunnerService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {
    super();
  }

  @Option({
    flags: '-f, --force',
    description: 'Skip workspace version safety check',
    required: false,
  })
  parseForce(): boolean {
    return true;
  }

  @Option({
    flags: '--include-slow',
    description: 'Also run slow instance commands (data migration + DDL)',
    required: false,
  })
  parseIncludeSlow(): boolean {
    return true;
  }

  async run(
    _passedParams: string[],
    options: RunInstanceCommandsOptions,
  ): Promise<void> {
    try {
      await this.checkWorkspaceVersionSafety(options);
      await this.runLegacyPendingTypeOrmMigrations();

      const activeOrSuspendedWorkspaceIds =
        await this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds();

      const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

      for (const step of sequence) {
        if (step.kind === 'fast-instance') {
          const result =
            await this.instanceUpgradeService.runFastInstanceCommand({
              command: step.command,
              name: step.name,
            });

          if (result.status === 'failed') {
            throw result.error;
          }
        }

        if (step.kind === 'slow-instance' && options.includeSlow) {
          const result =
            await this.instanceUpgradeService.runSlowInstanceCommand({
              command: step.command,
              name: step.name,
              skipDataMigration: activeOrSuspendedWorkspaceIds.length === 0,
            });

          if (result.status === 'failed') {
            throw result.error;
          }
        }
      }

      this.logger.log(chalk.green('Instance commands completed'));
    } catch (error) {
      this.logger.error(
        chalk.red(`Instance commands failed: ${error.message}`),
      );
      throw error;
    }
  }

  private async checkWorkspaceVersionSafety(
    options: RunInstanceCommandsOptions,
  ): Promise<void> {
    if (options.force) {
      this.logger.warn(
        chalk.yellow('Skipping workspace version check (--force flag used)'),
      );

      return;
    }

    const activeOrSuspendedWorkspaceIds =
      await this.workspaceVersionService.getActiveOrSuspendedWorkspaceIds();

    if (activeOrSuspendedWorkspaceIds.length === 0) {
      return;
    }

    const previousVersion =
      TWENTY_PREVIOUS_VERSIONS[TWENTY_PREVIOUS_VERSIONS.length - 1];

    const lastWorkspaceCommand =
      this.upgradeCommandRegistryService.getLastWorkspaceCommandForVersion(
        previousVersion,
      );

    if (!lastWorkspaceCommand) {
      return;
    }

    const allAtPreviousVersion =
      await this.upgradeMigrationService.areAllWorkspacesAtCommand({
        commandName: lastWorkspaceCommand.name,
        workspaceIds: activeOrSuspendedWorkspaceIds,
      });

    if (!allAtPreviousVersion) {
      throw new Error(
        'Unable to run instance commands. Some workspace(s) have not completed ' +
          `the last workspace command for ${previousVersion} ("${lastWorkspaceCommand.name}").\n` +
          'Please ensure all workspaces are upgraded to at least the previous version before running migrations.\n' +
          'Use --force to bypass this check (not recommended).',
      );
    }
  }

  private async runLegacyPendingTypeOrmMigrations(): Promise<void> {
    this.logger.log('Running legacy TypeORM migrations...');

    const migrations = await this.dataSource.runMigrations({
      transaction: 'each',
    });

    if (migrations.length === 0) {
      this.logger.log('No pending legacy migrations');
    } else {
      this.logger.log(
        `Executed ${migrations.length} legacy migration(s): ${migrations.map((migration) => migration.name).join(', ')}`,
      );
    }
  }
}
