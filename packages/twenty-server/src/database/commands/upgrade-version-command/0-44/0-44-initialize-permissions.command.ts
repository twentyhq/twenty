import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared';
import { IsNull, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandOptions,
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:0-44:initialize-permissions',
  description: 'Initialize permissions',
})
export class InitializePermissionsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace, 'core')
    protected readonly userWorkspaceRepository: Repository<UserWorkspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    try {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      let adminRoleId: string | undefined;

      const workspaceRoles =
        await this.roleService.getWorkspaceRoles(workspaceId);

      adminRoleId = workspaceRoles.find(
        (role) => role.label === ADMIN_ROLE_LABEL,
      )?.id;

      if (!isDefined(adminRoleId)) {
        adminRoleId = await this.createAdminRole({
          workspaceId,
          options,
        });
      }

      await this.assignAdminRole({
        workspaceId,
        adminRoleId,
        options,
      });

      let memberRoleId: string | undefined;

      memberRoleId = workspaceRoles.find(
        (role) => role.label === MEMBER_ROLE_LABEL,
      )?.id;

      if (!isDefined(memberRoleId)) {
        memberRoleId = await this.createMemberRole({
          workspaceId,
          options,
        });
      }

      await this.setMemberRoleAsDefaultRole({
        workspaceId,
        memberRoleId,
        options,
      });

      await this.assignMemberRoleToUserWorkspacesWithoutRole({
        workspaceId,
        memberRoleId,
        options,
      });
    } catch (error) {
      this.logger.log(
        chalk.red(`Error in workspace ${workspaceId} - ${error.message}`),
      );
    }
  }

  private async createAdminRole({
    workspaceId,
    options,
  }: {
    workspaceId: string;
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  }) {
    this.logger.log(
      chalk.green(`Creating admin role ${options.dryRun ? '(dry run)' : ''}`),
    );

    if (options.dryRun) {
      return '';
    }

    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    return adminRole.id;
  }

  private async createMemberRole({
    workspaceId,
    options,
  }: {
    workspaceId: string;
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  }) {
    this.logger.log(
      chalk.green(`Creating member role ${options.dryRun ? '(dry run)' : ''}`),
    );

    if (options.dryRun) {
      return '';
    }

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
    });

    return memberRole.id;
  }

  private async setMemberRoleAsDefaultRole({
    workspaceId,
    memberRoleId,
    options,
  }: {
    workspaceId: string;
    memberRoleId: string;
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  }) {
    const workspaceDefaultRole = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!isDefined(workspaceDefaultRole?.defaultRoleId)) {
      this.logger.log(
        chalk.green(
          `Setting member role as default role ${options.dryRun ? '(dry run)' : ''}`,
        ),
      );

      if (options.dryRun) {
        return;
      }

      await this.workspaceRepository.update(workspaceId, {
        defaultRoleId: memberRoleId,
      });
    }
  }

  private async assignAdminRole({
    workspaceId,
    adminRoleId,
    options,
  }: {
    workspaceId: string;
    adminRoleId: string;
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  }) {
    const oldestUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
      order: {
        user: {
          createdAt: 'ASC',
        },
      },
    });

    if (!oldestUserWorkspace) {
      throw new Error('No user workspace found');
    }

    this.logger.log(
      chalk.green(
        `Assigning admin role to user ${oldestUserWorkspace.id} ${options.dryRun ? '(dry run)' : ''}`,
      ),
    );

    if (options.dryRun) {
      return;
    }

    await this.userRoleService.assignRoleToUserWorkspace({
      roleId: adminRoleId,
      userWorkspaceId: oldestUserWorkspace.id,
      workspaceId,
    });
  }

  private async assignMemberRoleToUserWorkspacesWithoutRole({
    workspaceId,
    memberRoleId,
    options,
  }: {
    workspaceId: string;
    memberRoleId: string;
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  }) {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId,
      },
      relations: {
        user: true,
      },
    });

    const rolesByUserWorkspace =
      await this.userRoleService.getRolesByUserWorkspaces({
        userWorkspaceIds: userWorkspaces.map(
          (userWorkspace) => userWorkspace.id,
        ),
        workspaceId,
      });

    for (const userWorkspace of userWorkspaces) {
      // If userWorkspace has a role, do nothing
      if (
        rolesByUserWorkspace
          .get(userWorkspace.id)
          ?.some((role) => isDefined(role))
      ) {
        this.logger.log(
          chalk.green(
            `User workspace ${userWorkspace.id} already has a role. Skipping member role assignation`,
          ),
        );
        continue;
      }

      this.logger.log(
        chalk.green(
          `Assigning member role to user workspace ${userWorkspace.id} ${options.dryRun ? '(dry run)' : ''}`,
        ),
      );

      if (options.dryRun) {
        continue;
      }

      // Otherwise, assign member role to userWorkspace
      await this.userRoleService.assignRoleToUserWorkspace({
        roleId: memberRoleId,
        userWorkspaceId: userWorkspace.id,
        workspaceId,
      });
    }
  }
}
