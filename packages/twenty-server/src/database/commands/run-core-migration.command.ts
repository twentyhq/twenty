import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { RegisteredInstanceMigrationService } from 'src/engine/core-modules/upgrade/services/registered-instance-migration-registry.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

type RunCoreMigrationCommandOptions = {
  force?: boolean;
};

@Command({
  name: 'run-core-migration',
  description:
    'Run TypeORM core migrations then registered instance commands',
})
export class RunCoreMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(RunCoreMigrationCommand.name);

  constructor(
    private readonly coreEngineVersionService: CoreEngineVersionService,
    private readonly workspaceVersionService: WorkspaceVersionService,
    private readonly registeredInstanceMigrationService: RegisteredInstanceMigrationService,
    private readonly instanceUpgradeService: InstanceUpgradeService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    options: RunCoreMigrationCommandOptions,
  ): Promise<void> {
    if (options.force) {
      this.logger.warn(
        chalk.yellow('Skipping workspace version check (--force flag used)'),
      );
    } else {
      this.checkWorkspaceVersions();
    }

    await this.runLegacyTypeOrmMigrations();
    await this.runInstanceCommands();

    this.logger.log('All core migrations completed successfully');
  }

  private async checkWorkspaceVersions(): Promise<void> {
    const previousVersion =
      this.coreEngineVersionService.getPreviousVersion();

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
        'Unable to run core migrations. Some workspace(s) are below the minimum required version.\n' +
          'Please ensure all workspaces are on at least the previous minor version before running migrations.\n' +
          'Use --force to bypass this check (not recommended).',
      );
    }
  }

  private async runLegacyTypeOrmMigrations(): Promise<void> {
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

  private async runInstanceCommands(): Promise<void> {
    const instanceCommands =
      this.registeredInstanceMigrationService.getAllInstanceCommands();

    if (instanceCommands.length === 0) {
      this.logger.log('No registered instance commands');

      return;
    }

    this.logger.log(
      `Running ${instanceCommands.length} instance command(s)...`,
    );

    for (const { version, migration } of instanceCommands) {
      const migrationName = migration.constructor.name;
      const result = await this.instanceUpgradeService.runSingleMigration(
        migration,
        version,
      );

      switch (result.status) {
        case 'success':
          this.logger.log(`  ${migrationName} — executed`);
          break;
        case 'already-executed':
          this.logger.log(`  ${migrationName} — already executed, skipping`);
          break;
        case 'failed':
          this.logger.error(`  ${migrationName} — failed`);
          throw result.error;
      }
    }
  }
}
