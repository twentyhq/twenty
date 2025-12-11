import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-11:clean-orphaned-role-targets',
  description:
    'Clean up roleTargets records that reference non-existent userWorkspaces',
})
export class CleanOrphanedRoleTargetsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRunOnce = false;
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.log('This command has already been run');

      return;
    }
    const isDryRun = options.dryRun || false;

    if (isDryRun) {
      this.logger.log('Dry run mode: No changes will be applied');
    }

    const orphanedRoleTargets = await this.roleTargetRepository
      .createQueryBuilder('roleTarget')
      .leftJoin(
        UserWorkspaceEntity,
        'userWorkspace',
        'userWorkspace.id = roleTarget.userWorkspaceId',
      )
      .where('roleTarget.userWorkspaceId IS NOT NULL')
      .andWhere('userWorkspace.id IS NULL')
      .select([
        'roleTarget.id',
        'roleTarget.userWorkspaceId',
        'roleTarget.workspaceId',
      ])
      .getMany();

    if (orphanedRoleTargets.length === 0) {
      this.logger.log('No orphaned roleTargets found');

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `DRY RUN: Would delete ${orphanedRoleTargets.length} orphaned roleTarget(s):`,
      );
      orphanedRoleTargets.forEach((roleTarget) => {
        this.logger.log(
          `  - roleTargetId: ${roleTarget.id}, userWorkspaceId: ${roleTarget.userWorkspaceId}, workspaceId: ${roleTarget.workspaceId}`,
        );
      });

      this.hasRunOnce = true;

      return;
    }

    const orphanedIds = orphanedRoleTargets.map((roleTarget) => roleTarget.id);

    await this.roleTargetRepository.delete({ id: In(orphanedIds) });

    this.logger.log(
      `Deleted ${orphanedRoleTargets.length} orphaned roleTarget(s)`,
    );

    this.hasRunOnce = true;
  }
}
