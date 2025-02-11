import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import { LimitAmountOfViewFieldCommand } from 'src/database/commands/upgrade-version/0-42/0-42-limit-amount-of-view-field';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Command({
  name: 'upgrade-0.42',
  description: 'Upgrade to 0.42',
})
export class UpgradeTo0_42Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly limitAmountOfViewFieldCommand: LimitAmountOfViewFieldCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: BaseCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to upgrade to 0.42');

    await this.limitAmountOfViewFieldCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
