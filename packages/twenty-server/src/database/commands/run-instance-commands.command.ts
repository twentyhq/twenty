import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

type RunInstanceCommandsOptions = {
  force?: boolean;
  includeSlow?: boolean;
};

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
    private readonly coreEngineVersionService: CoreEngineVersionService,
    private readonly workspaceVersionService: WorkspaceVersionService,
    private readonly upgradeCommandRegistryService: UpgradeCommandRegistryService,
    private readonly instanceUpgradeService: InstanceUpgradeService,
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

      for (const {
        command,
        name,
      } of this.upgradeCommandRegistryService.getAllFastInstanceCommands()) {
        const result = await this.instanceUpgradeService.runFastInstanceCommand(
          {
            command,
            name,
          },
        );

        if (result.status === 'failed') {
          throw result.error;
        }
      }

      if (options.includeSlow) {
        const hasWorkspaces =
          await this.workspaceVersionService.hasActiveOrSuspendedWorkspaces();

        for (const {
          command,
          name,
        } of this.upgradeCommandRegistryService.getAllSlowInstanceCommands()) {
          const result =
            await this.instanceUpgradeService.runSlowInstanceCommand({
              command,
              name,
              skipDataMigration: !hasWorkspaces,
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

  private async checkWorkspaceVersionSafety(
    options: RunInstanceCommandsOptions,
  ): Promise<void> {
    if (options.force) {
      this.logger.warn(
        chalk.yellow('Skipping workspace version check (--force flag used)'),
      );

      return;
    }

    const previousVersion = this.coreEngineVersionService.getPreviousVersion();

    const workspacesBelow =
      await this.workspaceVersionService.getWorkspacesBelowVersion(
        previousVersion.version,
      );

    if (workspacesBelow.length > 0) {
      for (const workspace of workspacesBelow) {
        this.logger.error(
          chalk.red(
            `Workspace ${workspace.id} (${workspace.displayName}) is at version ${workspace.version ?? 'undefined'}, which is below the minimum required version.`,
          ),
        );
      }

      throw new Error(
        'Unable to run instance commands. Some workspace(s) are below the minimum required version.\n' +
          'Please ensure all workspaces are on at least the previous minor version before running migrations.\n' +
          'Use --force to bypass this check (not recommended).',
      );
    }
  }
}
