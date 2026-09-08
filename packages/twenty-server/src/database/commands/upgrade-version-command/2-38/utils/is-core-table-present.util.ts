import { type QueryRunner } from 'typeorm';

// An instance without billing never grew the billing tables, and
// DROP COLUMN IF EXISTS still fails when the table itself is missing.
export const isCoreTablePresent = async (
  queryRunner: QueryRunner,
  tableName: string,
): Promise<boolean> => {
  const rows = await queryRunner.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = $1`,
    [tableName],
  );

  return rows.length > 0;
};
