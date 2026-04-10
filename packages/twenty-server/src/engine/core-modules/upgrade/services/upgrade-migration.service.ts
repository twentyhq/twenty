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

  async getCompletedCommandNames(
    workspaceId: string | null,
  ): Promise<Set<string>> {
    const completedMigrations = await this.upgradeMigrationRepository
      .createQueryBuilder('migration')
      .select('migration.name')
      .where({
        workspaceId: workspaceId === null ? IsNull() : workspaceId,
      })
      .andWhere(
        `migration.attempt = (
          SELECT MAX(sub.attempt)
          FROM core."upgradeMigration" sub
          WHERE sub.name = migration.name
          AND sub."workspaceId" ${workspaceId === null ? 'IS NULL' : `= :workspaceId`}
        )`,
        workspaceId === null ? {} : { workspaceId },
      )
      .andWhere('migration.status = :status', { status: 'completed' })
      .getMany();

    return new Set(completedMigrations.map((migration) => migration.name));
  }

  async areAllCommandsCompleted({
    names,
    workspaceId,
  }: {
    names: string[];
    workspaceId: string | null;
  }): Promise<boolean> {
    if (names.length === 0) {
      return true;
    }

    const completedNames = await this.getCompletedCommandNames(workspaceId);

    return names.every((name) => completedNames.has(name));
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
