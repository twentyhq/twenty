import { type DataSource, type QueryRunner } from 'typeorm';

import { createCoreIndexConcurrently } from 'src/database/commands/upgrade-version-command/2-49/utils/create-core-index-concurrently.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const INDEX_NAME = 'IDX_APPLICATION_REGISTRATION_ID_ID';
const CREATE_INDEX_QUERY = `CREATE INDEX IF NOT EXISTS "${INDEX_NAME}" ON "core"."application" ("applicationRegistrationId", "id") WHERE "deletedAt" IS NULL AND "applicationRegistrationId" IS NOT NULL`;

@RegisteredInstanceCommand('2.49.0', 1792144523838, { type: 'slow' })
export class AddApplicationRegistrationStatsIndexSlowInstanceCommand implements SlowInstanceCommand {
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
