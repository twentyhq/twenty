import { Logger } from '@nestjs/common';

import chalk from 'chalk';
import { CommandRunner, Option } from 'nest-commander';

export type BaseCommandOptions = {
  workspaceId?: string;
  dryRun?: boolean;
};

export abstract class BaseCommandRunner extends CommandRunner {
  protected readonly logger: Logger;

  constructor() {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Simulate the command without making actual changes',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  override async run(
    passedParams: string[],
    options: BaseCommandOptions,
  ): Promise<void> {
    try {
      await this.executeBaseCommand(passedParams, options);
    } catch (error) {
      this.logger.error(chalk.red(`Command failed`));
      throw error;
    } finally {
      this.logger.log(chalk.blue('Command completed!'));
    }
  }

  protected abstract executeBaseCommand(
    passedParams: string[],
    options: BaseCommandOptions,
  ): Promise<void>;
}
