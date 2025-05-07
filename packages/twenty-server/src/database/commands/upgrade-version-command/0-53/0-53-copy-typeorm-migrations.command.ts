import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { MigrationCommandRunner } from 'src/database/commands/command-runners/migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Command({
  name: 'upgrade:0-53:copy-typeorm-migrations',
  description: 'Copy _typeorm_migrations from metadata schema to core schema',
})
export class CopyTypeormMigrationsCommand extends MigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }

  override async runMigrationCommand(
    passedParams: string[],
    options?: { dryRun?: boolean },
  ): Promise<void> {
    this.logger.log(
      'Starting to copy _typeorm_migrations from metadata to core',
    );

    const queryRunner =
      this.workspaceRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const metadataMigrations = await queryRunner.query(
        'SELECT * FROM metadata._typeorm_migrations ORDER BY id ASC',
      );

      this.logger.log(
        `Found ${metadataMigrations.length} migrations in metadata schema`,
      );

      if (options?.dryRun) {
        this.logger.log('Dry run mode - no changes will be applied');

        return;
      }

      const existingCoreMigrations = await queryRunner.query(
        'SELECT name FROM core._typeorm_migrations',
      );

      const existingMigrationNames = new Set(
        existingCoreMigrations.map((migration) => migration.name),
      );

      for (const migration of metadataMigrations) {
        if (!existingMigrationNames.has(migration.name)) {
          await queryRunner.query(
            'INSERT INTO core._typeorm_migrations ("timestamp", name) VALUES ($1, $2)',
            [migration.timestamp, migration.name],
          );
          this.logger.log(`Copied migration: ${migration.name}`);
        } else {
          this.logger.log(
            `Migration ${migration.name} already exists in core schema`,
          );
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully copied all migrations from metadata to core schema',
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to copy migrations: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
