import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

type DuplicateKey = 'apiKeyId' | 'agentId' | 'userWorkspaceId';

type DuplicateGroup = {
  foreignKeyId: string;
  duplicateKey: DuplicateKey;
};

@Command({
  name: 'upgrade:1-13:deduplicate-role-targets',
  description:
    'Remove duplicate roleTargets keeping only the most recently updated one for each unique constraint',
})
export class DeduplicateRoleTargetsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    const duplicateGroups =
      await this.findDuplicateGroupsForWorkspace(workspaceId);

    if (duplicateGroups.length === 0) {
      return;
    }

    const idsToDelete: string[] = [];

    for (const duplicateGroup of duplicateGroups) {
      const duplicateIds = await this.findDuplicateIdsToDelete(
        workspaceId,
        duplicateGroup,
      );

      idsToDelete.push(...duplicateIds);
    }

    if (idsToDelete.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `DRY RUN: Would delete ${idsToDelete.length} duplicate roleTarget(s)`,
      );

      return;
    }

    await this.roleTargetRepository.delete({ id: In(idsToDelete) });

    this.logger.log(`Deleted ${idsToDelete.length} duplicate roleTarget(s)`);
  }

  private async findDuplicateGroupsForWorkspace(
    workspaceId: string,
  ): Promise<DuplicateGroup[]> {
    const duplicateGroups: DuplicateGroup[] = [];

    const duplicateKeys: DuplicateKey[] = [
      'apiKeyId',
      'agentId',
      'userWorkspaceId',
    ];

    for (const duplicateKey of duplicateKeys) {
      const duplicates = await this.roleTargetRepository
        .createQueryBuilder('roleTarget')
        .select([`roleTarget.${duplicateKey} AS "foreignKeyId"`])
        .where('roleTarget.workspaceId = :workspaceId', { workspaceId })
        .andWhere(`roleTarget.${duplicateKey} IS NOT NULL`)
        .groupBy(`roleTarget.${duplicateKey}`)
        .having('COUNT(*) > 1')
        .getRawMany<{ foreignKeyId: string }>();

      for (const duplicate of duplicates) {
        duplicateGroups.push({
          foreignKeyId: duplicate.foreignKeyId,
          duplicateKey,
        });
      }
    }

    return duplicateGroups;
  }

  private async findDuplicateIdsToDelete(
    workspaceId: string,
    duplicateGroup: DuplicateGroup,
  ): Promise<string[]> {
    const { foreignKeyId, duplicateKey } = duplicateGroup;

    const roleTargets = await this.roleTargetRepository.find({
      where: {
        workspaceId,
        [duplicateKey]: foreignKeyId,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    // Keep the first one (most recently updated), delete the rest
    return roleTargets.slice(1).map((roleTarget) => roleTarget.id);
  }
}
