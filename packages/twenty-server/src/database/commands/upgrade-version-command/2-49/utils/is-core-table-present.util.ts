import { type QueryRunner } from 'typeorm';

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
