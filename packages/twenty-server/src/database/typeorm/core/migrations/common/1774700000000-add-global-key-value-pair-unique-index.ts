import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddGlobalKeyValuePairUniqueIndex1774700000000
  implements MigrationInterface
{
  name = 'AddGlobalKeyValuePairUniqueIndex1774700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "core"."keyValuePair"
      WHERE id IN (
        SELECT id
        FROM (
          SELECT
            id,
            ROW_NUMBER() OVER (
              PARTITION BY key
              ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
            ) AS row_number
          FROM "core"."keyValuePair"
          WHERE "userId" IS NULL
            AND "workspaceId" IS NULL
        ) ranked_key_value_pairs
        WHERE ranked_key_value_pairs.row_number > 1
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE" ON "core"."keyValuePair" ("key") WHERE "userId" is NULL AND "workspaceId" is NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE"`,
    );
  }
}
