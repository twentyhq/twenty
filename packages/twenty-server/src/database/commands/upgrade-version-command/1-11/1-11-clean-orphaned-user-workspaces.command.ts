import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, type Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Command({
  name: 'upgrade:1-11:clean-orphaned-user-workspaces',
  description:
    'Clean up userWorkspace records that do not have a corresponding workspaceMember in the workspace schema',
})
export class CleanOrphanedUserWorkspacesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId,
      },
    });

    if (userWorkspaces.length === 0) {
      this.logger.log(
        `No userWorkspaces found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMembers = await workspaceMemberRepository.find({
      select: ['userId'],
    });

    const workspaceMemberUserIds = new Set(
      workspaceMembers.map((member) => member.userId),
    );

    const orphanedUserWorkspaces = userWorkspaces.filter(
      (userWorkspace) => !workspaceMemberUserIds.has(userWorkspace.userId),
    );

    if (orphanedUserWorkspaces.length === 0) {
      this.logger.log(
        `No orphaned userWorkspaces found for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `DRY RUN: Would delete ${orphanedUserWorkspaces.length} orphaned userWorkspace(s) for workspace ${workspaceId}:`,
      );
      orphanedUserWorkspaces.forEach((userWorkspace) => {
        this.logger.log(
          `  - userWorkspaceId: ${userWorkspace.id}, userId: ${userWorkspace.userId}`,
        );
      });

      return;
    }

    // Delete orphaned userWorkspaces
    const orphanedIds = orphanedUserWorkspaces.map((uw) => uw.id);

    await this.userWorkspaceRepository.delete({ id: In(orphanedIds) });

    this.logger.log(
      `Deleted ${orphanedUserWorkspaces.length} orphaned userWorkspace(s) for workspace ${workspaceId}`,
    );
  }
}
