import { type QueryRunner } from 'typeorm';

export const findIndexValidityByName = async ({
  queryRunner,
  schemaName,
  indexNames,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  indexNames: string[];
}): Promise<Map<string, boolean>> => {
  const indexes: { indexName: string; isValid: boolean }[] =
    await queryRunner.query(
      `SELECT c.relname AS "indexName", i.indisvalid AS "isValid"
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_index i ON i.indexrelid = c.oid
       WHERE n.nspname = $1 AND c.relname = ANY($2)`,
      [schemaName, indexNames],
    );

  return new Map(indexes.map(({ indexName, isValid }) => [indexName, isValid]));
};
