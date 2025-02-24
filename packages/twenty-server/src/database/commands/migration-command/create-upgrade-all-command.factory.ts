import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { MigrationCommandInterface } from 'src/database/commands/migration-command/interfaces/migration-command.interface';

import { BaseCommandOptions } from 'src/database/commands/base.command';
import { ActiveWorkspacesMigrationCommandRunner } from 'src/database/commands/migration-command/active-workspaces-migration-command.runner';
import { MIGRATION_COMMAND_INJECTION_TOKEN } from 'src/database/commands/migration-command/migration-command.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export function createUpgradeAllCommand(
  version: string,
): new (...args: unknown[]) => ActiveWorkspacesMigrationCommandRunner {
  @Command({
    name: `upgrade-${version}`,
    description: `Upgrade to version ${version}`,
  })
  class UpgradeCommand extends ActiveWorkspacesMigrationCommandRunner {
    constructor(
      @Inject(MIGRATION_COMMAND_INJECTION_TOKEN)
      private readonly subCommands: MigrationCommandInterface[],
      @InjectRepository(Workspace, 'core')
      protected readonly workspaceRepository: Repository<Workspace>,
      protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    ) {
      super(workspaceRepository, twentyORMGlobalManager);
    }

    protected async executeActiveWorkspacesMigrationCommand(
      passedParams: string[],
      options: BaseCommandOptions,
      activeWorkspaceIds: string[],
    ): Promise<void> {
      console.log(`Running upgrade command for version ${version}`);

      for (const command of this.subCommands) {
        await command.execute(passedParams, options, activeWorkspaceIds);
      }

      console.log(`Upgrade ${version} command completed!`);
    }
  }

  return UpgradeCommand;
}
