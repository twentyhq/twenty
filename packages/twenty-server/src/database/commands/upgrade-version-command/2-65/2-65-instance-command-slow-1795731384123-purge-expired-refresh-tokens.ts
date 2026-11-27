import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const PURGE_BATCH_SIZE = 10000;

@RegisteredInstanceCommand('2.65.0', 1795731384123, { type: 'slow' })
export class PurgeExpiredRefreshTokensSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    let deletedCount = 0;

    do {
      [, deletedCount] = await dataSource.query<[unknown[], number]>(
        `DELETE FROM "core"."appToken"
          WHERE "id" IN (
            SELECT "id" FROM "core"."appToken"
             WHERE "type" = 'REFRESH_TOKEN'
               AND (
                 "expiresAt" < now()
                 OR "revokedAt" IS NOT NULL
                 OR "deletedAt" IS NOT NULL
               )
             LIMIT $1
          )`,
        [PURGE_BATCH_SIZE],
      );
    } while (deletedCount === PURGE_BATCH_SIZE);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ALTER COLUMN "type" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ALTER COLUMN "type" SET DEFAULT 'REFRESH_TOKEN'`,
    );
  }
}
