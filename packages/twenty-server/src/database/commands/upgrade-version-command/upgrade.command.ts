import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { MigrateRichTextContentPatchCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-rich-text-content-patch.command';
import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/upgrade-version-command/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade',
  description: 'Upgrade workspaces to the latest version',
})
export class UpgradeCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly migrateRichTextContentPatchCommand: MigrateRichTextContentPatchCommand,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running UpgradeCommand for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.migrateRichTextContentPatchCommand.runOnWorkspace({
      index,
      total,
      workspaceId,
      options,
      dataSource,
    });
  }
}
