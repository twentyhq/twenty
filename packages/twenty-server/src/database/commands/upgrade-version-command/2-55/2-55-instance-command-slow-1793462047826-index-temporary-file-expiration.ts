import { type DataSource, type QueryRunner } from 'typeorm';

import { createCoreIndexConcurrently } from 'src/database/commands/upgrade-version-command/2-46/utils/create-core-index-concurrently.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const INDEX_NAME = 'IDX_FILE_TEMPORARY_EXPIRES_AT';
const CREATE_INDEX_QUERY = `CREATE INDEX IF NOT EXISTS "${INDEX_NAME}" ON "core"."file" (("settings"->>'expiresAt')) WHERE "status" = 'UPLOADED' AND "workspaceId" IS NOT NULL AND "deletedAt" IS NULL AND "settings" @> '{"isTemporaryFile":true}'`;

@RegisteredInstanceCommand('2.55.0', 1793462047826, { type: 'slow' })
export class IndexTemporaryFileExpirationSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await createCoreIndexConcurrently({
      dataSource,
      indexName: INDEX_NAME,
      createIndexQuery: CREATE_INDEX_QUERY,
    });
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(CREATE_INDEX_QUERY);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."${INDEX_NAME}"`);
  }
}
