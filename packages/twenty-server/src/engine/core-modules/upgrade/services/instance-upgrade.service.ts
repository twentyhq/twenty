import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, MigrationInterface } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';

export type RunSingleMigrationResult =
  | { status: 'success' }
  | { status: 'already-executed' }
  | { status: 'failed'; error: unknown };

@Injectable()
export class InstanceUpgradeService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  async runSingleMigration(
    migration: MigrationInterface,
  ): Promise<RunSingleMigrationResult> {
    const migrationName = migration.constructor.name;
    const executedByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const isAlreadyCompleted =
      await this.upgradeMigrationService.isLastAttemptCompleted({
        name: migrationName,
        workspaceId: null,
      });

    if (isAlreadyCompleted) {
      return { status: 'already-executed' };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await migration.up(queryRunner);

      await this.upgradeMigrationService.markAsCompleted({
        name: migrationName,
        workspaceId: null,
        executedByVersion,
        queryRunner,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      await this.upgradeMigrationService.markAsFailed({
        name: migrationName,
        workspaceId: null,
        executedByVersion,
      });

      return { status: 'failed', error };
    } finally {
      await queryRunner.release();
    }

    return { status: 'success' };
  }
}
