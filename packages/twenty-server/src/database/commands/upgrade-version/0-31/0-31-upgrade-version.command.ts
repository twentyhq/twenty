import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BackfillWorkspaceFavoritesCommand } from 'src/database/commands/upgrade-version/0-31/0-31-backfill-workspace-favorites.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

interface UpdateTo0_31CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.31',
  description: 'Upgrade to 0.31',
})
export class UpgradeTo0_31Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly backfillWorkspaceFavoritesCommand: BackfillWorkspaceFavoritesCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_31CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.backfillWorkspaceFavoritesCommand.executeActiveWorkspacesCommand(
      passedParam,
      {
        ...options,
      },
      workspaceIds,
    );
  }
}
