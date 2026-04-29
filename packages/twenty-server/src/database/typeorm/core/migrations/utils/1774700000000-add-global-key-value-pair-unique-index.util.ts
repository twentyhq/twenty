import { type QueryRunner } from 'typeorm';

export const addGlobalKeyValuePairUniqueIndexQueries = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  await queryRunner.query(
    `DROP INDEX IF EXISTS "core"."IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE"`,
  );

  await queryRunner.query(
    `CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE" ON "core"."keyValuePair" ("key") WHERE "userId" is NULL AND "workspaceId" is NULL`,
  );
};
