import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { CommandRunner, Option } from 'nest-commander';

import { MigrationCommandInterface } from 'src/database/commands/migration-command/interfaces/migration-command.interface';

import { CommandLogger } from 'src/database/commands/logger';

export type MigrationCommandOptions = {
  workspaceId?: string;
  dryRun?: boolean;
  verbose?: boolean;
};

export abstract class MigrationCommandRunner<
    Options extends MigrationCommandOptions = MigrationCommandOptions,
  >
  extends CommandRunner
  implements MigrationCommandInterface<Options>
{
  protected logger: CommandLogger | Logger;
  constructor() {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Simulate the command without making actual changes',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Verbose output',
    required: false,
  })
  parseVerbose(): boolean {
    return true;
  }

  override async run(passedParams: string[], options: Options): Promise<void> {
    if (options.verbose) {
      this.logger = new CommandLogger({
        verbose: true,
        constructorName: this.constructor.name,
      });
    }

    try {
      await this.runMigrationCommand(passedParams, options);
    } catch (error) {
      this.logger.error(chalk.red(`Command failed`));
      throw error;
    } finally {
      this.logger.log(chalk.blue('Command completed!'));
    }
  }

  abstract runMigrationCommand(
    passedParams: string[],
    options: Options,
  ): Promise<void>;
}
