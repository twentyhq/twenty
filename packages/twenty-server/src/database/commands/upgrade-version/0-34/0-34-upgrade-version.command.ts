import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { GenerateDefaultSubdomainCommand } from 'src/database/commands/upgrade-version/0-34/0-34-generate-subdomain.command';

interface UpdateTo0_34CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.34',
  description: 'Upgrade to 0.34',
})
export class UpgradeTo0_34Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly generateDefaultSubdomainCommand: GenerateDefaultSubdomainCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_34CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.generateDefaultSubdomainCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
