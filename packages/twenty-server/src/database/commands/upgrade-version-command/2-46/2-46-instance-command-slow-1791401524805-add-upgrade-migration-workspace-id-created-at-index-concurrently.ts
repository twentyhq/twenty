import { type DataSource, type QueryRunner } from 'typeorm';

import { createCoreIndexConcurrently } from 'src/database/commands/upgrade-version-command/2-46/utils/create-core-index-concurrently.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const INDEX_NAME = 'IDX_UPGRADE_MIGRATION_WORKSPACE_ID_CREATED_AT';

const CREATE_INDEX_QUERY = `CREATE INDEX IF NOT EXISTS "${INDEX_NAME}" ON "core"."upgradeMigration" ("workspaceId", "createdAt") WHERE "workspaceId" IS NOT NULL`;

// upgradeMigration holds a row per workspace for every command, so building
// this index under a lock would block every workspace sign-up meanwhile
@RegisteredInstanceCommand('2.46.0', 1791401524805, { type: 'slow' })
export class AddUpgradeMigrationWorkspaceIdCreatedAtIndexConcurrentlySlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await createCoreIndexConcurrently({
      dataSource,
      indexName: INDEX_NAME,
      createIndexQuery: CREATE_INDEX_QUERY,
    });
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(CREATE_INDEX_QUERY);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."${INDEX_NAME}"`);
  }
}
