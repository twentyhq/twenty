import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { PhoneCallingCodeCreateColumnCommand } from 'src/database/commands/upgrade-version/0-35/0-35-phone-calling-code-create-column.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

interface UpdateTo0_35CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.35',
  description: 'Upgrade to 0.35',
})
export class UpgradeTo0_35Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly phoneCallingCodeCreateColumnCommand: PhoneCallingCodeCreateColumnCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_35CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.phoneCallingCodeCreateColumnCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
