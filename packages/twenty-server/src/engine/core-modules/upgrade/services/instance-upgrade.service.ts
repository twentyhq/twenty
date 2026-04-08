import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';

type RunSingleMigrationResult =
  | { status: 'success' }
  | { status: 'already-executed' }
  | { status: 'failed'; error: unknown };

@Injectable()
export class InstanceUpgradeService {
  private readonly logger = new Logger(InstanceUpgradeService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  async runFastInstanceCommand({
    command,
    name,
  }: {
    command: FastInstanceCommand;
    name: string;
  }): Promise<RunSingleMigrationResult> {
    const migrationName = name;
    const executedByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    const isAlreadyCompleted =
      await this.upgradeMigrationService.isLastAttemptCompleted({
        name: migrationName,
        workspaceId: null,
      });

    if (isAlreadyCompleted) {
      this.logger.log(`${migrationName} already executed, skipping`);

      return { status: 'already-executed' };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await command.up(queryRunner);

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

      this.logger.error(
        `${migrationName} failed`,
        error instanceof Error ? error.stack : String(error),
      );

      return { status: 'failed', error };
    } finally {
      await queryRunner.release();
    }

    this.logger.log(`${migrationName} executed successfully`);

    return { status: 'success' };
  }

  async runSlowInstanceCommand({
    command,
    name,
    skipDataMigration,
  }: {
    command: SlowInstanceCommand;
    name: string;
    skipDataMigration?: boolean;
  }): Promise<RunSingleMigrationResult> {
    if (!skipDataMigration) {
      const migrationName = name;
      const executedByVersion =
        this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

      try {
        await command.runDataMigration(this.dataSource);
      } catch (error) {
        await this.upgradeMigrationService.markAsFailed({
          name: migrationName,
          workspaceId: null,
          executedByVersion,
        });

        this.logger.error(
          `${migrationName} data migration failed`,
          error instanceof Error ? error.stack : String(error),
        );

        return { status: 'failed', error };
      }
    }

    return this.runFastInstanceCommand({ command, name });
  }
}
