import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, type QueryRunner, Repository } from 'typeorm';

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
}
