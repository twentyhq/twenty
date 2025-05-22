import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:0-54:migrate-default-avatar-url-to-user-workspace',
  description: 'Migrate default avatar url to user workspace',
})
export class MigrateDefaultAvatarUrlToUserWorkspaceCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace, 'core')
    protected readonly userWorkspaceRepository: Repository<UserWorkspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.migrateDefaultAvatarUrlToUserWorkspace({
      workspaceId,
      dryRun: !!options.dryRun,
    });
  }

  private async migrateDefaultAvatarUrlToUserWorkspace({
    workspaceId,
    dryRun,
  }: {
    workspaceId: string;
    dryRun: boolean;
  }) {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: {
        id: workspaceId,
      },
      relations: ['workspaceUsers', 'workspaceUsers.user'],
    });

    for (const workspaceUser of workspace.workspaceUsers) {
      if (isNonEmptyString(workspaceUser.user.defaultAvatarUrl)) {
        const userWorkspacesCount = await this.userWorkspaceRepository.count({
          where: {
            userId: workspaceUser.user.id,
          },
        });

        if (userWorkspacesCount === 1) {
          if (!dryRun)
            await this.userWorkspaceRepository.update(
              {
                userId: workspaceUser.user.id,
                workspaceId: workspace.id,
              },
              {
                defaultAvatarUrl: workspaceUser.user.defaultAvatarUrl,
              },
            );

          this.logger.log(
            `Updated default avatar url for user ${workspaceUser.user.id} on user workspace ${workspaceUser.id}`,
          );
        }
      }
    }
  }
}
