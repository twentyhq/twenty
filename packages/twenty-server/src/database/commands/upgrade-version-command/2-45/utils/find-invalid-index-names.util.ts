import { type QueryRunner } from 'typeorm';

export const findInvalidIndexNames = async ({
  queryRunner,
  schemaName,
  indexNames,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  indexNames: string[];
}): Promise<string[]> => {
  const invalidIndexes: { name: string }[] = await queryRunner.query(
    `SELECT c.relname AS name
     FROM pg_index i
     JOIN pg_class c ON c.oid = i.indexrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = $1 AND c.relname = ANY($2) AND NOT i.indisvalid`,
    [schemaName, indexNames],
  );

  return invalidIndexes.map(({ name }) => name);
};
