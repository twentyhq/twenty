import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, MigrationInterface, Repository } from 'typeorm';

import { InstanceUpgradeEntity } from 'src/engine/core-modules/upgrade/instance-upgrade.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type RunSingleMigrationResult =
  | { status: 'success' }
  | { status: 'already-executed' }
  | { status: 'failed'; error: unknown };

@Injectable()
export class InstanceUpgradeService {
  constructor(
    @InjectRepository(InstanceUpgradeEntity)
    private readonly instanceUpgradeRepository: Repository<InstanceUpgradeEntity>,
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

      await this.markFailed(migrationName, version);

      return { status: 'failed', error };
    } finally {
      await queryRunner.release();
    }

    await this.markExecuted(migrationName, version);

    return { status: 'success' };
  }

  private async isExecuted(name: string): Promise<boolean> {
    return this.instanceUpgradeRepository.exists({
      where: { name, status: 'completed' },
    });
  }

  private async markExecuted(name: string, version: string): Promise<void> {
    const runByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const existing = await this.instanceUpgradeRepository.findOne({
      where: { name },
    });

    if (existing) {
      await this.instanceUpgradeRepository.update(existing.id, {
        status: 'completed',
        retry: existing.retry + 1,
        runByVersion,
      });

      return;
    }

    await this.instanceUpgradeRepository.save({
      name,
      version,
      status: 'completed',
      retry: 0,
      runByVersion,
    });
  }

  private async markFailed(name: string, version: string): Promise<void> {
    const runByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const existing = await this.instanceUpgradeRepository.findOne({
      where: { name },
    });

    if (existing) {
      await this.instanceUpgradeRepository.update(existing.id, {
        status: 'failed',
        retry: existing.retry + 1,
        runByVersion,
      });

      return;
    }

    await this.instanceUpgradeRepository.save({
      name,
      version,
      status: 'failed',
      retry: 0,
      runByVersion,
    });
  }
}
