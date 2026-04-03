import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';

import { CoreMigrationRunnerService } from 'src/database/commands/core-migration/services/core-migration-runner.service';
import { CoreEngineVersionService } from 'src/engine/core-engine-version/services/core-engine-version.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

type RunCoreMigrationCommandOptions = {
  force?: boolean;
};

@Command({
  name: 'run-core-migration',
  description:
    'Run TypeORM core migrations with workspace version safety check',
})
export class RunCoreMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(RunCoreMigrationCommand.name);

  constructor(
    private readonly coreEngineVersionService: CoreEngineVersionService,
    private readonly workspaceVersionService: WorkspaceVersionService,
    private readonly coreMigrationRunnerService: CoreMigrationRunnerService,
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
          'Unable to run TypeORM migrations. Some workspace(s) are below the minimum required version.\n' +
            'Please ensure all workspaces are on at least the previous minor version before running migrations.\n' +
            'Use --force to bypass this check (not recommended).',
        );
      }
    }

    await this.coreMigrationRunnerService.runAllPendingMigrations();
  }
}
