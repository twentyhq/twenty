import { type DataSource } from 'typeorm';

// A concurrent build that failed leaves an invalid index that IF NOT EXISTS
// would then keep, so it is dropped before building again
export const createCoreIndexConcurrently = async ({
  dataSource,
  indexName,
  createIndexQuery,
}: {
  dataSource: DataSource;
  indexName: string;
  createIndexQuery: string;
}): Promise<void> => {
  const invalidIndexes: { name: string }[] = await dataSource.query(
    `SELECT index_class.relname AS name
     FROM pg_index
     JOIN pg_class index_class ON index_class.oid = pg_index.indexrelid
     JOIN pg_namespace namespace ON namespace.oid = index_class.relnamespace
     WHERE namespace.nspname = 'core'
       AND index_class.relname = $1
       AND NOT pg_index.indisvalid`,
    [indexName],
  );

  if (invalidIndexes.length > 0) {
    await dataSource.query(
      `DROP INDEX CONCURRENTLY IF EXISTS "core"."${indexName}"`,
    );
  }

  await dataSource.query(
    createIndexQuery.replace(' INDEX ', ' INDEX CONCURRENTLY '),
  );
};
