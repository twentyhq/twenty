import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

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
  name: 'upgrade:1-7:regenerate-person-search-vector-with-phones',
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
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    this.logger.log(
      `Regenerating person search vector for workspace ${workspaceId} in schema ${schemaName}`,
    );

    // Check if person table exists
    const personTableExists = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = 'person'
      );
    `);

    if (!personTableExists[0]?.exists) {
      this.logger.log(`Person table does not exist in workspace ${workspaceId}, skipping`);
      return;
    }

    // Check if searchVector column exists
    const searchVectorColumnExists = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = '${schemaName}'
        AND table_name = 'person'
        AND column_name = 'searchVector'
      );
    `);

    if (!searchVectorColumnExists[0]?.exists) {
      this.logger.log(`searchVector column does not exist in workspace ${workspaceId}, skipping`);
      return;
    }

    try {
      // Generate the new search vector expression with phone support
      const newSearchVectorExpression = getTsVectorColumnExpressionFromFields(
        SEARCH_FIELDS_FOR_PERSON,
      );

      this.logger.log(
        `Dropping existing searchVector column for workspace ${workspaceId}`,
      );

      // Drop the existing searchVector column
      await this.coreDataSource.query(`
        ALTER TABLE "${schemaName}"."person"
        DROP COLUMN "searchVector"
      `);

      this.logger.log(
        `Creating new searchVector column with phone indexing for workspace ${workspaceId}`,
      );

      // Create the new searchVector column with updated expression
      await this.coreDataSource.query(`
        ALTER TABLE "${schemaName}"."person"
        ADD COLUMN "searchVector" tsvector
        GENERATED ALWAYS AS (${newSearchVectorExpression}) STORED
      `);

      this.logger.log(
        `Recreating GIN index on searchVector for workspace ${workspaceId}`,
      );

      // Recreate the GIN index for full-text search performance
      await this.coreDataSource.query(`
        CREATE INDEX "IDX_person_searchVector"
        ON "${schemaName}"."person"
        USING GIN ("searchVector")
      `);

      this.logger.log(
        `Successfully regenerated person search vector for workspace ${workspaceId}`,
      );

    } catch (error) {
      this.logger.error(
        `Failed to regenerate person search vector for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
  }
}