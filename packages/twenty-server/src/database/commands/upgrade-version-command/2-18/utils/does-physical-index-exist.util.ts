import { type QueryRunner } from 'typeorm';

// Physical catalog introspection is an upgrade-only concern: in normal
// operation metadata is the source of truth and migrations never need to ask
// Postgres whether an index actually exists. Keep this helper scoped to the
// legacy index name normalization command instead of the shared schema
// manager.
//
// Query pg_class/pg_namespace directly instead of the pg_indexes view: the
// view joins pg_index against pg_class twice and derives schemaname from the
// table's namespace, which prevents an index lookup and can scan the whole
// catalog on large multi-tenant clusters. This lookup hits the unique
// (relname, relnamespace) index on pg_class.
export const doesPhysicalIndexExist = async ({
  queryRunner,
  schemaName,
  indexName,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  indexName: string;
}): Promise<boolean> => {
  const result: { exists: boolean }[] = await queryRunner.query(
    `SELECT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = $2 AND n.nspname = $1 AND c.relkind IN ('i', 'I')
    ) AS "exists"`,
    [schemaName, indexName],
  );

  return result[0]?.exists === true;
};
