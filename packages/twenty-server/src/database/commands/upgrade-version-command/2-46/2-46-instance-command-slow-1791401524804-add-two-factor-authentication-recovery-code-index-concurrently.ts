import { type DataSource, type QueryRunner } from 'typeorm';

import { createCoreIndexConcurrently } from 'src/database/commands/upgrade-version-command/2-46/utils/create-core-index-concurrently.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const INDEX_NAME = 'IDX_APP_TOKEN_RECOVERY_CODE_PENDING_UNIQUE';

const CREATE_INDEX_QUERY = `CREATE UNIQUE INDEX IF NOT EXISTS "${INDEX_NAME}" ON "core"."appToken" ("userId", "workspaceId") WHERE "type" = 'TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE' AND "deletedAt" IS NULL AND "revokedAt" IS NULL`;

// appToken holds every refresh token, so building this index under a lock
// would block logins and token refreshes for the whole build
@RegisteredInstanceCommand('2.46.0', 1791401524804, { type: 'slow' })
export class AddTwoFactorAuthenticationRecoveryCodeIndexConcurrentlySlowInstanceCommand implements SlowInstanceCommand {
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
