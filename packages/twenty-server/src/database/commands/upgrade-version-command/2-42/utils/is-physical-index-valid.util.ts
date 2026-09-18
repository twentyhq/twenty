import { type QueryRunner } from 'typeorm';

// Physical catalog introspection is an upgrade-only concern: in normal
// operation metadata is the source of truth and migrations never need to ask
// Postgres for index state.
//
// Plain existence is not enough around CONCURRENTLY creates: a failed
// CREATE [UNIQUE] INDEX CONCURRENTLY leaves a physical index with
// pg_index.indisvalid = false, which satisfies IF NOT EXISTS on reruns
// without enforcing anything. Returns null when the index is absent,
// otherwise its validity.
//
// Query pg_class/pg_namespace directly instead of the pg_indexes view: the
// view joins pg_index against pg_class twice and derives schemaname from the
// table's namespace, which prevents an index lookup and can scan the whole
// catalog on large multi-tenant clusters. This lookup hits the unique
// (relname, relnamespace) index on pg_class.
export const isPhysicalIndexValid = async ({
  queryRunner,
  schemaName,
  indexName,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  indexName: string;
}): Promise<boolean | null> => {
  const result: { valid: boolean }[] = await queryRunner.query(
    `SELECT i.indisvalid AS "valid"
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_index i ON i.indexrelid = c.oid
    WHERE c.relname = $2 AND n.nspname = $1 AND c.relkind IN ('i', 'I')`,
    [schemaName, indexName],
  );

  return result[0]?.valid ?? null;
};
