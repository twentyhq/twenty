import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { UpdateRichTextSearchVectorCommand } from 'src/database/commands/upgrade-version/0-32/0-33/0-33-update-rich-text-search-vector-expression';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

interface UpdateTo0_33CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.33',
  description: 'Upgrade to 0.33',
})
export class UpgradeTo0_33Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly updateRichTextSearchVectorCommand: UpdateRichTextSearchVectorCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_33CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.updateRichTextSearchVectorCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
