import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const UNIQUE_INDEX_NAME =
  'IDX_CONNECTED_ACCOUNT_PROVIDER_USER_WORKSPACE_UNIQUE';
const SUPERSEDED_INDEX_NAME = 'IDX_CONNECTED_ACCOUNT_CONNECTION_PROVIDER_ID';

@RegisteredInstanceCommand('2.39.0', 1788778467183, { type: 'slow' })
export class EnforceOneAppConnectionPerUserSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(`
      DELETE FROM "core"."connectedAccount"
      WHERE "id" IN (
        SELECT "id" FROM (
          SELECT
            "id",
            ROW_NUMBER() OVER (
              PARTITION BY "connectionProviderId", "userWorkspaceId"
              ORDER BY
                ("authFailedAt" IS NULL) DESC,
                "lastCredentialsRefreshedAt" DESC NULLS LAST,
                "createdAt" ASC
            ) AS "rank"
          FROM "core"."connectedAccount"
          WHERE "connectionProviderId" IS NOT NULL
        ) ranked
        WHERE "rank" > 1
      )
    `);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "${UNIQUE_INDEX_NAME}" ON "core"."connectedAccount" ("connectionProviderId", "userWorkspaceId") WHERE "connectionProviderId" IS NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${SUPERSEDED_INDEX_NAME}"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "${SUPERSEDED_INDEX_NAME}" ON "core"."connectedAccount" ("connectionProviderId")`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${UNIQUE_INDEX_NAME}"`,
    );
  }
}
