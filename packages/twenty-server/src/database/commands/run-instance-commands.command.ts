import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

type RunInstanceCommandsOptions = {
  force?: boolean;
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

  async run(
    _passedParams: string[],
    options: RunInstanceCommandsOptions,
  ): Promise<void> {
    try {
      await this.checkWorkspaceVersionSafety(options);
      await this.runLegacyPendingTypeOrmMigrations();
      await this.runAllInstanceCommands();

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

  private async runAllInstanceCommands(): Promise<void> {
    const allInstanceCommands =
      this.upgradeCommandRegistryService.getAllInstanceCommands();

    if (allInstanceCommands.length === 0) {
      this.logger.log('No registered instance commands');

      return;
    }

    this.logger.log(
      `Running ${allInstanceCommands.length} instance command(s) across all versions...`,
    );

    for (const { version, migration } of allInstanceCommands) {
      const migrationName = migration.constructor.name;
      const result =
        await this.instanceUpgradeService.runSingleMigration(migration);

      switch (result.status) {
        case 'already-executed': {
          this.logger.log(
            `Instance command ${migrationName} (${version}) already executed, skipping`,
          );

          break;
        }
        case 'failed': {
          this.logger.error(
            `Instance command ${migrationName} (${version}) failed`,
          );

          if (isDefined(result.error)) {
            this.logger.error(
              result.error instanceof Error
                ? (result.error.stack ?? result.error.message)
                : String(result.error),
            );
          }

          throw new Error(
            `Instance command ${migrationName} (${version}) failed`,
          );
        }
        case 'success': {
          this.logger.log(
            `Instance command ${migrationName} (${version}) executed successfully`,
          );

          break;
        }
      }
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
