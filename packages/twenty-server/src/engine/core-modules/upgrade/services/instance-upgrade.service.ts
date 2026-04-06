import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, MigrationInterface, Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  UpgradeMigrationEntity,
  UpgradeMigrationStatus,
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
    version: string,
  ): Promise<RunSingleMigrationResult> {
    const migrationName = migration.constructor.name;

    if (await this.isExecuted(migrationName)) {
      return { status: 'already-executed' };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await migration.up(queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      await this.markStatus({
        name: migrationName,
        version,
        status: UpgradeMigrationStatus.FAILED,
      });

      return { status: 'failed', error };
    } finally {
      await queryRunner.release();
    }

    await this.markStatus({
      name: migrationName,
      version,
      status: UpgradeMigrationStatus.COMPLETED,
    });

    return { status: 'success' };
  }

  private async isExecuted(name: string): Promise<boolean> {
    return this.upgradeMigrationRepository.exists({
      where: { name, status: UpgradeMigrationStatus.COMPLETED },
    });
  }

  private async markStatus({
    name,
    status,
    version,
  }: {
    name: string;
    version: string;
    status: UpgradeMigrationStatus;
  }): Promise<void> {
    const runByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const existing = await this.upgradeMigrationRepository.findOne({
      where: { name },
    });

    if (existing) {
      await this.upgradeMigrationRepository.update(existing.id, {
        status,
        retry: existing.retry + 1,
        runByVersion,
      });

      return;
    }

    await this.upgradeMigrationRepository.save({
      name,
      version,
      status,
      retry: 0,
      runByVersion,
    });
  }
}
