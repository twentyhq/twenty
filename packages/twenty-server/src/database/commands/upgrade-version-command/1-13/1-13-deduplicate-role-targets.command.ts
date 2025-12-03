import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, type Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

type DuplicateKey = 'apiKeyId' | 'agentId' | 'userWorkspaceId';

type DuplicateGroup = {
  workspaceId: string;
  foreignKeyId: string;
  duplicateKey: DuplicateKey;
};

@Command({
  name: 'upgrade:1-13:deduplicate-role-targets',
  description:
    'Remove duplicate roleTargets keeping only the most recently updated one for each unique constraint',
})
export class DeduplicateRoleTargetsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private hasRunOnce = false;

  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

    const duplicateGroups = await this.findAllDuplicateGroups();

    if (duplicateGroups.length === 0) {
      this.logger.log('No duplicate roleTargets found');
      this.hasRunOnce = true;

      return;
    }

    const idsToDelete: string[] = [];

    for (const duplicateGroup of duplicateGroups) {
      const duplicateIds =
        await this.findDuplicateIdsToDelete(duplicateGroup);

      idsToDelete.push(...duplicateIds);
    }

    if (idsToDelete.length === 0) {
      this.logger.log('No duplicate roleTargets to delete');
      this.hasRunOnce = true;

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `DRY RUN: Would delete ${idsToDelete.length} duplicate roleTarget(s)`,
      );
      this.hasRunOnce = true;

      return;
    }

    await this.roleTargetRepository.delete({ id: In(idsToDelete) });

    this.logger.log(`Deleted ${idsToDelete.length} duplicate roleTarget(s)`);

    this.hasRunOnce = true;
  }

  private async findAllDuplicateGroups(): Promise<DuplicateGroup[]> {
    const duplicateGroups: DuplicateGroup[] = [];

    const duplicateKeys: DuplicateKey[] = [
      'apiKeyId',
      'agentId',
      'userWorkspaceId',
    ];

    for (const duplicateKey of duplicateKeys) {
      const duplicates = await this.roleTargetRepository
        .createQueryBuilder('roleTarget')
        .select([
          'roleTarget.workspaceId AS "workspaceId"',
          `roleTarget.${duplicateKey} AS "foreignKeyId"`,
        ])
        .where(`roleTarget.${duplicateKey} IS NOT NULL`)
        .groupBy(`roleTarget.workspaceId, roleTarget.${duplicateKey}`)
        .having('COUNT(*) > 1')
        .getRawMany<{ workspaceId: string; foreignKeyId: string }>();

      for (const duplicate of duplicates) {
        duplicateGroups.push({
          workspaceId: duplicate.workspaceId,
          foreignKeyId: duplicate.foreignKeyId,
          duplicateKey,
        });
      }
    }

    return duplicateGroups;
  }

  private async findDuplicateIdsToDelete(
    duplicateGroup: DuplicateGroup,
  ): Promise<string[]> {
    const { workspaceId, foreignKeyId, duplicateKey } = duplicateGroup;

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

