import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import { StandardizeVariableViewFilterSyntaxCommand } from 'src/database/commands/upgrade-version/0-41/0-41-standardize-variable-view-filter-syntax.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Command({
  name: 'upgrade-0.41',
  description: 'Upgrade to 0.41',
})
export class UpgradeTo0_41Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly standardizeVariableViewFilterSyntaxCommand: StandardizeVariableViewFilterSyntaxCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: BaseCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to upgrade to 0.41');

    await this.standardizeVariableViewFilterSyntaxCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
} 