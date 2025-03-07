import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared';
import { Repository } from 'typeorm';

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

      await this.assignAdminRoleToMembers({
        workspaceId,
        adminRoleId,
        options,
      });

      await this.setAdminRoleAsDefaultRole({
        workspaceId,
        adminRoleId,
        options,
      });

      const memberRole = workspaceRoles.find(
        (role) => role.label === MEMBER_ROLE_LABEL,
      );

      if (!isDefined(memberRole)) {
        await this.createMemberRole({
          workspaceId,
          options,
        });
      }
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

  private async setAdminRoleAsDefaultRole({
    workspaceId,
    adminRoleId,
    options,
  }: {
    workspaceId: string;
    adminRoleId: string;
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  }) {
    const workspaceDefaultRole = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (isDefined(workspaceDefaultRole?.defaultRoleId)) {
      this.logger.log(
        chalk.green(
          'Workspace already has a default role. Skipping setting admin role as default role',
        ),
      );

      return;
    }

    this.logger.log(
      chalk.green(
        `Setting admin role as default role ${options.dryRun ? '(dry run)' : ''}`,
      ),
    );

    if (options.dryRun) {
      return;
    }

    await this.workspaceRepository.update(workspaceId, {
      defaultRoleId: adminRoleId,
    });
  }

  private async assignAdminRoleToMembers({
    workspaceId,
    adminRoleId,
    options,
  }: {
    workspaceId: string;
    adminRoleId: string;
    options: ActiveOrSuspendedWorkspacesMigrationCommandOptions;
  }) {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId,
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
      if (
        rolesByUserWorkspace
          .get(userWorkspace.id)
          ?.some((role) => isDefined(role))
      ) {
        this.logger.log(
          chalk.green(
            `User workspace ${userWorkspace.id} already has a role. Skipping role assignation`,
          ),
        );
        continue;
      }

      this.logger.log(
        chalk.green(
          `Assigning admin role to workspace member ${userWorkspace.id} ${options.dryRun ? '(dry run)' : ''}`,
        ),
      );

      if (options.dryRun) {
        continue;
      }

      await this.userRoleService.assignRoleToUserWorkspace({
        roleId: adminRoleId,
        userWorkspaceId: userWorkspace.id,
        workspaceId,
      });
    }
  }
}
