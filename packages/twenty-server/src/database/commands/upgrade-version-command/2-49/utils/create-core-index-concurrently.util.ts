import { DataSource } from 'typeorm';

// A concurrent build can outlast the core pool's request query_timeout, so it
// runs on its own connection without one. A failed build leaves an invalid
// index that IF NOT EXISTS would then keep, so it is dropped first.
export const createCoreIndexConcurrently = async ({
  dataSource,
  indexName,
  createIndexQuery,
}: {
  dataSource: DataSource;
  indexName: string;
  createIndexQuery: string;
}): Promise<void> => {
  const coreDataSourceOptions = dataSource.options;

  if (coreDataSourceOptions.type !== 'postgres') {
    throw new Error(
      `Concurrent index builds need a postgres datasource, got ${coreDataSourceOptions.type}`,
    );
  }

  const indexBuildDataSource = await new DataSource({
    ...coreDataSourceOptions,
    entities: [],
    migrations: [],
    subscribers: [],
    poolSize: 1,
    extra: {
      ...coreDataSourceOptions.extra,
      query_timeout: undefined,
    },
  }).initialize();

  try {
    const invalidIndexes: { name: string }[] =
      await indexBuildDataSource.query(
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
      await indexBuildDataSource.query(
        `DROP INDEX CONCURRENTLY IF EXISTS "core"."${indexName}"`,
      );
    }

    await indexBuildDataSource.query(
      createIndexQuery.replace(' INDEX ', ' INDEX CONCURRENTLY '),
    );
  } finally {
    await indexBuildDataSource.destroy();
  }
};
