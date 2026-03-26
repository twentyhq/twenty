import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';

import { CoreMigrationRunnerService } from 'src/database/commands/services/core-migration-runner.service';
import { WorkspaceVersionCheckService } from 'src/database/commands/services/workspace-version-check.service';
import { UpgradeCommand } from 'src/database/commands/upgrade-version-command/upgrade.command';

type RunTypeormMigrationCommandOptions = {
  force?: boolean;
};

@Command({
  name: 'run-typeorm-migration',
  description:
    'Run TypeORM core migrations with workspace version safety check',
})
export class RunTypeormMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(RunTypeormMigrationCommand.name);

  constructor(
    private readonly workspaceVersionCheckService: WorkspaceVersionCheckService,
    private readonly coreMigrationRunnerService: CoreMigrationRunnerService,
    private readonly upgradeCommand: UpgradeCommand,
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
    options: RunTypeormMigrationCommandOptions,
  ): Promise<void> {
    if (options.force) {
      this.logger.warn(
        chalk.yellow('Skipping workspace version check (--force flag used)'),
      );
    } else {
      await this.workspaceVersionCheckService.assertNoWorkspacesBelowMinimumVersion(
        Object.keys(this.upgradeCommand.allCommands),
      );
    }

    await this.coreMigrationRunnerService.run();
  }
}
