import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  MigrationInterface,
  type QueryRunner,
  Repository,
} from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  UpgradeMigrationEntity,
  type UpgradeMigrationStatus,
} from 'src/engine/core-modules/upgrade/upgrade-migration.entity';

export type RunSingleMigrationResult =
  | { status: 'success' }
  | { status: 'already-executed' }
  | { status: 'failed'; error: unknown };

@Injectable()
export class InstanceUpgradeService {
  constructor(
    @InjectRepository(UpgradeMigrationEntity)
    private readonly upgradeMigrationRepository: Repository<UpgradeMigrationEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async runSingleMigration(
    migration: MigrationInterface,
  ): Promise<RunSingleMigrationResult> {
    const migrationName = migration.constructor.name;
    const runByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const isAlreadyExecuted = await this.upgradeMigrationRepository.exists({
      where: { name: migrationName, status: 'completed' },
    });

    if (isAlreadyExecuted) {
      return { status: 'already-executed' };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await migration.up(queryRunner);

      await this.markAsCompleted({
        queryRunner,
        name: migrationName,
        runByVersion,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      await this.markFailed({
        name: migrationName,
        runByVersion,
      });

      return { status: 'failed', error };
    } finally {
      await queryRunner.release();
    }

    return { status: 'success' };
  }

  private async markAsCompleted({
    queryRunner,
    name,
    runByVersion,
  }: {
    queryRunner: QueryRunner;
    name: string;
    runByVersion: string;
  }): Promise<void> {
    const repository = queryRunner.manager.getRepository(
      UpgradeMigrationEntity,
    );

    const retry = await repository.count({ where: { name } });

    await repository.save({
      name,
      status: 'completed' as UpgradeMigrationStatus,
      retry,
      runByVersion,
    });
  }

  private async markFailed({
    name,
    runByVersion,
  }: {
    name: string;
    runByVersion: string;
  }): Promise<void> {
    const retry = await this.upgradeMigrationRepository.count({
      where: { name },
    });

    await this.upgradeMigrationRepository.save({
      name,
      status: 'failed' as UpgradeMigrationStatus,
      retry,
      runByVersion,
    });
  }
}
