import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, type QueryRunner, Repository } from 'typeorm';

import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { formatUpgradeErrorForStorage } from 'src/engine/core-modules/upgrade/utils/format-upgrade-error-for-storage.util';

@Injectable()
export class UpgradeMigrationService {
  constructor(
    @InjectRepository(UpgradeMigrationEntity)
    private readonly upgradeMigrationRepository: Repository<UpgradeMigrationEntity>,
  ) {}

  async isLastAttemptCompleted({
    name,
    workspaceId,
  }: {
    name: string;
    workspaceId: string | null;
  }): Promise<boolean> {
    const latestAttempt = await this.upgradeMigrationRepository.findOne({
      where: {
        name,
        workspaceId: workspaceId === null ? IsNull() : workspaceId,
      },
      order: { attempt: 'DESC' },
    });

    return isDefined(latestAttempt) && latestAttempt.status === 'completed';
  }

  async markAsCompleted({
    name,
    workspaceId,
    executedByVersion,
    queryRunner,
  }: {
    name: string;
    workspaceId: string | null;
    executedByVersion: string;
    queryRunner?: QueryRunner;
  }): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(UpgradeMigrationEntity)
      : this.upgradeMigrationRepository;
    const previousAttempts = await repository.count({
      where: {
        name,
        workspaceId: workspaceId === null ? IsNull() : workspaceId,
      },
    });

    await repository.save({
      name,
      status: 'completed',
      attempt: previousAttempts + 1,
      executedByVersion,
      workspaceId,
    });
  }

  async markAsFailed({
    name,
    workspaceId,
    executedByVersion,
    error,
  }: {
    name: string;
    workspaceId: string | null;
    executedByVersion: string;
    error: unknown;
  }): Promise<void> {
    const previousAttempts = await this.upgradeMigrationRepository.count({
      where: {
        name,
        workspaceId: workspaceId === null ? IsNull() : workspaceId,
      },
    });

    await this.upgradeMigrationRepository.save({
      name,
      status: 'failed',
      attempt: previousAttempts + 1,
      executedByVersion,
      workspaceId,
      errorMessage: formatUpgradeErrorForStorage(error),
    });
  }

  async markAsInitial({
    name,
    workspaceId,
    executedByVersion,
  }: {
    name: string;
    workspaceId: string | null;
    executedByVersion: string;
  }): Promise<void> {
    const previousAttempts = await this.upgradeMigrationRepository.count({
      where: {
        name,
        workspaceId: workspaceId === null ? IsNull() : workspaceId,
      },
    });

    await this.upgradeMigrationRepository.save({
      name,
      status: 'completed',
      isInitial: true,
      attempt: previousAttempts + 1,
      executedByVersion,
      workspaceId,
    });
  }

  // Returns the name of the most recently completed command (by createdAt)
  // across all scopes (instance and workspace).
  async getLastCompletedCommandNameOrThrow(): Promise<string> {
    const migration = await this.upgradeMigrationRepository
      .createQueryBuilder('migration')
      .select('migration.name')
      .where({ status: 'completed' })
      .andWhere(
        `migration.attempt = (
          SELECT MAX(sub.attempt)
          FROM core."upgradeMigration" sub
          WHERE sub.name = migration.name
          AND (
            (sub."workspaceId" IS NULL AND migration."workspaceId" IS NULL)
            OR sub."workspaceId" = migration."workspaceId"
          )
        )`,
      )
      .orderBy('migration.createdAt', 'DESC')
      .getOne();

    if (!migration) {
      throw new Error(
        'No completed upgrade migration found — the database may not have been initialized',
      );
    }

    return migration.name;
  }

  async getWorkspaceCursorsOrThrow(
    workspaceIds: string[],
  ): Promise<Map<string, string>> {
    if (workspaceIds.length === 0) {
      return new Map();
    }

    const results = await this.upgradeMigrationRepository
      .createQueryBuilder('migration')
      .select('migration.workspaceId', 'workspaceId')
      .addSelect('migration.name', 'name')
      .where({
        workspaceId: In(workspaceIds),
        status: 'completed',
      })
      .andWhere(
        `migration.attempt = (
          SELECT MAX(sub.attempt)
          FROM core."upgradeMigration" sub
          WHERE sub.name = migration.name
          AND sub."workspaceId" = migration."workspaceId"
        )`,
      )
      .orderBy('migration.createdAt', 'DESC')
      .distinctOn(['migration.workspaceId'])
      .getRawMany<{ workspaceId: string; name: string }>();

    const cursors = new Map<string, string>();

    for (const row of results) {
      cursors.set(row.workspaceId, row.name);
    }

    const missingWorkspaceIds = workspaceIds.filter(
      (workspaceId) => !cursors.has(workspaceId),
    );

    if (missingWorkspaceIds.length > 0) {
      throw new Error(
        `No completed upgrade migration found for workspace(s): ${missingWorkspaceIds.join(', ')}`,
      );
    }

    return cursors;
  }

  async areAllWorkspacesAtCommand({
    commandName,
    workspaceIds,
  }: {
    commandName: string;
    workspaceIds: string[];
  }): Promise<boolean> {
    if (workspaceIds.length === 0) {
      return true;
    }

    const completedCount = await this.upgradeMigrationRepository
      .createQueryBuilder('migration')
      .where({
        name: commandName,
        status: 'completed',
        workspaceId: In(workspaceIds),
      })
      .andWhere(
        `migration.attempt = (
          SELECT MAX(sub.attempt)
          FROM core."upgradeMigration" sub
          WHERE sub.name = migration.name
          AND sub."workspaceId" = migration."workspaceId"
        )`,
      )
      .getCount();

    return completedCount === workspaceIds.length;
  }
}
