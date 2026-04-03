import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource, MigrationExecutor, type QueryRunner } from 'typeorm';

export type RunSingleMigrationError =
  | 'already-executed'
  | 'migration-execution-failed'
  | 'migration-instance-not-defined'
  | 'migration-not-registered';

export type RunSingleMigrationResult =
  | { status: 'success' }
  | { code: RunSingleMigrationError; error?: unknown; status: 'fail' };

@Injectable()
export class CoreMigrationRunnerService {
  private readonly logger = new Logger(CoreMigrationRunnerService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async runAllPendingMigrations(): Promise<void> {
    this.logger.log('Running core datasource migrations...');

    try {
      const migrations = await this.dataSource.runMigrations({
        transaction: 'each',
      });

      if (migrations.length === 0) {
        this.logger.log('No pending migrations');
      } else {
        this.logger.log(
          `Executed ${migrations.length} migration(s): ${migrations.map((migration) => migration.name).join(', ')}`,
        );
      }

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Error running database migrations:', error);
      throw error;
    }
  }

  async runSingleMigration(
    migrationName: string,
  ): Promise<RunSingleMigrationResult> {
    this.logger.log(`Running core datasource migration ${migrationName}...`);

    const queryRunner = this.dataSource.createQueryRunner();
    const migrationExecutor = new MigrationExecutor(
      this.dataSource,
      queryRunner,
    );

    try {
      await queryRunner.connect();

      const pendingMigrations = await migrationExecutor.getPendingMigrations();
      const pendingMigration = pendingMigrations.find(
        (migration) => migration.name === migrationName,
      );

      if (!pendingMigration) {
        const registeredMigration = (
          await migrationExecutor.getAllMigrations()
        ).find((migration) => migration.name === migrationName);

        if (!registeredMigration) {
          return {
            code: 'migration-not-registered',
            status: 'fail',
          };
        }

        return {
          code: 'already-executed',
          status: 'fail',
        };
      }

      if (!pendingMigration.instance) {
        return {
          code: 'migration-instance-not-defined',
          status: 'fail',
        };
      }

      await this.createMetadataTableIfNecessary(queryRunner);

      const shouldRunInTransaction =
        pendingMigration.instance.transaction ?? true;

      await queryRunner.beforeMigration();

      try {
        if (shouldRunInTransaction) {
          await queryRunner.startTransaction();
        }

        await pendingMigration.instance.up(queryRunner);
        await migrationExecutor.insertMigration(pendingMigration);

        if (shouldRunInTransaction) {
          await queryRunner.commitTransaction();
        }
      } catch (error) {
        if (shouldRunInTransaction && queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }

        throw error;
      } finally {
        await queryRunner.afterMigration();
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error running database migration:', error);

      return {
        code: 'migration-execution-failed',
        error,
        status: 'fail',
      };
    } finally {
      await queryRunner.release();
    }
  }

  private async createMetadataTableIfNecessary(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const schemaBuilder = this.dataSource.driver.createSchemaBuilder() as {
      createMetadataTableIfNecessary?: (
        queryRunnerToUse: QueryRunner,
      ) => Promise<void>;
    };

    if (schemaBuilder.createMetadataTableIfNecessary) {
      await schemaBuilder.createMetadataTableIfNecessary(queryRunner);
    }
  }
}
