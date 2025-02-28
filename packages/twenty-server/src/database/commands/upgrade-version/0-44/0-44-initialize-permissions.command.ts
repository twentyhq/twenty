import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { isDefined } from 'twenty-shared';
import { IsNull, Repository } from 'typeorm';

import { MigrationCommand } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import {
  MaintainedWorkspacesMigrationCommandOptions,
  MaintainedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/migration-command/maintained-workspaces-migration-command.runner';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@MigrationCommand({
  name: 'initialize-permissions',
  description: 'Initialize permissions',
  version: '0.44',
})
export class InitializePermissionsCommand extends MaintainedWorkspacesMigrationCommandRunner {
  private options: MaintainedWorkspacesMigrationCommandOptions;
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

  async runMigrationCommandOnMaintainedWorkspaces(
    _passedParam: string[],
    options: MaintainedWorkspacesMigrationCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(chalk.green('Running command to initialize permissions'));

    this.options = options;
    for (const [index, workspaceId] of workspaceIds.entries()) {
      await this.processWorkspace(workspaceId, index, workspaceIds.length);
    }

    this.logger.log(chalk.green('Command completed!'));
  }

  private async processWorkspace(
    workspaceId: string,
    index: number,
    total: number,
  ): Promise<void> {
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
        adminRoleId = await this.createAdminRole({ workspaceId });
      }

      await this.assignAdminRole({
        workspaceId,
        adminRoleId,
      });

      let memberRoleId: string | undefined;

      memberRoleId = workspaceRoles.find(
        (role) => role.label === MEMBER_ROLE_LABEL,
      )?.id;

      if (!isDefined(memberRoleId)) {
        memberRoleId = await this.createMemberRole({
          workspaceId,
        });
      }

      await this.setMemberRoleAsDefaultRole({
        workspaceId,
        memberRoleId,
      });

      await this.assignMemberRoleToUserWorkspacesWithoutRole({
        workspaceId,
        memberRoleId,
      });
    } catch (error) {
      this.logger.log(
        chalk.red(`Error in workspace ${workspaceId} - ${error.message}`),
      );
    }
  }

  private async createAdminRole({ workspaceId }: { workspaceId: string }) {
    this.logger.log(
      chalk.green(
        `Creating admin role ${this.options.dryRun ? '(dry run)' : ''}`,
      ),
    );

    if (this.options.dryRun) {
      return '';
    }

    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    return adminRole.id;
  }

  private async createMemberRole({ workspaceId }: { workspaceId: string }) {
    this.logger.log(
      chalk.green(
        `Creating member role ${this.options.dryRun ? '(dry run)' : ''}`,
      ),
    );

    if (this.options.dryRun) {
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
  }: {
    workspaceId: string;
    memberRoleId: string;
  }) {
    const workspaceDefaultRole = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!isDefined(workspaceDefaultRole?.defaultRoleId)) {
      this.logger.log(
        chalk.green(
          `Setting member role as default role ${this.options.dryRun ? '(dry run)' : ''}`,
        ),
      );

      if (this.options.dryRun) {
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
  }: {
    workspaceId: string;
    adminRoleId: string;
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
        `Assigning admin role to user ${oldestUserWorkspace.id} ${this.options.dryRun ? '(dry run)' : ''}`,
      ),
    );

    if (this.options.dryRun) {
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
  }: {
    workspaceId: string;
    memberRoleId: string;
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
          `Assigning member role to user workspace ${userWorkspace.id} ${this.options.dryRun ? '(dry run)' : ''}`,
        ),
      );

      if (this.options.dryRun) {
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
