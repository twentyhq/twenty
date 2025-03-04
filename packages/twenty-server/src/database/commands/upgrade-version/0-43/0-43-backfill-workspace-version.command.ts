import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Repository } from 'typeorm';

import { BatchActiveWorkspacesMigrationCommandRunner } from 'src/database/commands/migration-command/batch-active-workspaces-migration-command.runner';
import { MigrationCommand } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@MigrationCommand({
  name: 'backfill-workspace-version',
  description: 'Backfill workspace version field to "0.43"',
  version: '0.43',
})
export class BackfillWorkspaceVersionCommand extends BatchActiveWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  async runMigrationCommandOnWorkspace(
    workspaceId: string,
    index: number,
    total: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `Running version backfill for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      await this.backfillWorkspaceVersion(workspaceId);

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}.`),
      );
    } catch (error) {
      this.logger.log(
        chalk.red(`Error in workspace ${workspaceId} - ${error.message}`),
      );
    }
  }

  private async backfillWorkspaceVersion(workspaceId: string): Promise<void> {
    await this.workspaceRepository.update(
      { id: workspaceId },
      { version: '0.43' },
    );

    this.logger.log(
      chalk.green(
        `Successfully backfilled version to "0.43" for workspace ${workspaceId}`,
      ),
    );
  }
}
