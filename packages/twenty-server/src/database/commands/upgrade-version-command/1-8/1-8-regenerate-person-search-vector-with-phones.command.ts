import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository, type QueryRunner } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_PERSON } from 'src/modules/person/standard-objects/person.workspace-entity';

@Command({
  name: 'upgrade:1-8:regenerate-person-search-vector-with-phones',
  description:
    'Regenerate person search vector to include phone number indexing for existing workspaces',
})
export class RegeneratePersonSearchVectorWithPhonesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    await this.ensureUnaccentFunction();

    this.logger.log(
      `Regenerating person search vector for workspace ${workspaceId}`,
    );

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      await this.regenerateSearchVector(workspaceId, queryRunner);

      if (options.dryRun) {
        this.logger.log(
          `DRY RUN: Would regenerate person search vector for workspace ${workspaceId}`,
        );
      } else {
        await queryRunner.commitTransaction();
        this.logger.log(
          `Successfully regenerated person search vector for workspace ${workspaceId}`,
        );
      }
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      this.logger.error(
        `Failed to regenerate person search vector for workspace ${workspaceId}: ${error.message}`,
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async regenerateSearchVector(
    workspaceId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const newSearchVectorExpression = getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PERSON,
    );

    this.logger.log(
      `Dropping existing searchVector index for workspace ${workspaceId}`,
    );

    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schemaName}"."IDX_person_searchVector"
    `);

    this.logger.log(
      `Dropping existing searchVector column for workspace ${workspaceId}`,
    );

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "${schemaName}"."person"
      DROP COLUMN IF EXISTS "searchVector"
    `);

    this.logger.log(
      `Creating new searchVector column with phone indexing for workspace ${workspaceId}`,
    );

    await queryRunner.query(`
      ALTER TABLE "${schemaName}"."person"
      ADD COLUMN "searchVector" tsvector
      GENERATED ALWAYS AS (${newSearchVectorExpression}) STORED
    `);

    this.logger.log(
      `Recreating GIN index on searchVector for workspace ${workspaceId}`,
    );

    await queryRunner.query(`
      CREATE INDEX "IDX_person_searchVector"
      ON "${schemaName}"."person"
      USING GIN ("searchVector")
    `);
  }

  private async ensureUnaccentFunction(): Promise<void> {
    const result = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'unaccent_immutable'
      ) as function_exists
    `);

    if (!result[0]?.function_exists) {
      throw new Error(
        'The public.unaccent_immutable() function is required but not found. Please run database migrations first.',
      );
    }
  }
}
