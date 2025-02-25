import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';

import { MigrationCommandInterface } from 'src/database/commands/migration-command/interfaces/migration-command.interface';

import { MIGRATION_COMMAND_INJECTION_TOKEN } from 'src/database/commands/migration-command/migration-command.constants';
import { MigrationCommandRunner } from 'src/database/commands/migration-command/migration-command.runner';

export function createUpgradeAllCommand(
  version: string,
): new (...args: unknown[]) => MigrationCommandRunner {
  @Command({
    name: `upgrade-${version}`,
    description: `Upgrade to version ${version}`,
  })
  class UpgradeCommand extends MigrationCommandRunner {
    constructor(
      @Inject(MIGRATION_COMMAND_INJECTION_TOKEN)
      private readonly subCommands: MigrationCommandInterface[],
    ) {
      super();
    }

    async runMigrationCommand(
      passedParams: string[],
      options: Record<string, unknown>,
    ): Promise<void> {
      this.logger.log(`Running upgrade command for version ${version}`);

      for (const command of this.subCommands) {
        await command.runMigrationCommand(passedParams, options);
      }

      this.logger.log(`Upgrade ${version} command completed!`);
    }
  }

  return UpgradeCommand;
}
