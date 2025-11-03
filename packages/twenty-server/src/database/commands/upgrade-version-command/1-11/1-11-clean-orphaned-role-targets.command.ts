import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, type Repository } from 'typeorm';

import { MigrationCommandRunner } from 'src/database/commands/command-runners/migration.command-runner';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';

@Command({
  name: 'upgrade:1-11:clean-orphaned-role-targets',
  description:
    'Clean up roleTargets records that reference non-existent userWorkspaces',
})
export class CleanOrphanedRoleTargetsCommand extends MigrationCommandRunner {
  constructor(
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
  ) {
    super();
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: { dryRun?: boolean },
  ): Promise<void> {
    const isDryRun = options.dryRun || false;

    if (isDryRun) {
      this.logger.log('Dry run mode: No changes will be applied');
    }

    const orphanedRoleTargets = await this.roleTargetsRepository
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

      return;
    }

    // Delete orphaned roleTargets
    const orphanedIds = orphanedRoleTargets.map((rt) => rt.id);

    await this.roleTargetsRepository.delete({ id: In(orphanedIds) });

    this.logger.log(
      `Deleted ${orphanedRoleTargets.length} orphaned roleTarget(s)`,
    );
  }
}
