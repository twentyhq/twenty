import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type FindOptionsWhere,
  IsNull,
  type QueryRunner,
  Repository,
} from 'typeorm';

import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';

@Injectable()
export class UpgradeMigrationService {
  constructor(
    @InjectRepository(UpgradeMigrationEntity)
    private readonly upgradeMigrationRepository: Repository<UpgradeMigrationEntity>,
  ) {}

  async hasBeenExecuted({
    name,
    workspaceId,
  }: {
    name: string;
    workspaceId: string | null;
  }): Promise<boolean> {
    return this.upgradeMigrationRepository.exists({
      where: this.buildWhereClause({ name, workspaceId }),
    });
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
    const whereClause = this.buildWhereClause({ name, workspaceId });

    const previousAttempts = await repository.count({ where: whereClause });

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
  }: {
    name: string;
    workspaceId: string | null;
    executedByVersion: string;
  }): Promise<void> {
    const whereClause = this.buildWhereClause({ name, workspaceId });

    const previousAttempts = await this.upgradeMigrationRepository.count({
      where: whereClause,
    });

    await this.upgradeMigrationRepository.save({
      name,
      status: 'failed',
      attempt: previousAttempts + 1,
      executedByVersion,
      workspaceId,
    });
  }

  private buildWhereClause({
    name,
    workspaceId,
  }: {
    name: string;
    workspaceId: string | null;
  }): FindOptionsWhere<UpgradeMigrationEntity> {
    return {
      name,
      status: 'completed',
      workspaceId: workspaceId === null ? IsNull() : workspaceId,
    };
  }
}
