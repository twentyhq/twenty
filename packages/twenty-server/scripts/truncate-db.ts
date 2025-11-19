import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { performQuery } from './utils';

async function dropSchemasSequentially() {
  try {
    await rawDataSource.initialize();

    // Fetch all schemas excluding the ones we want to keep
    const schemas =
      (await performQuery<{ schema_name: string }[]>(
        `
      SELECT n.nspname AS "schema_name"
      FROM pg_catalog.pg_namespace n
      WHERE n.nspname !~ '^pg_'
        AND n.nspname <> 'information_schema'
        AND n.nspname NOT IN ('metric_helpers', 'user_management', 'public')
    `,
        'Fetching schemas...',
      )) ?? [];

    const batchSize = 10;

    for (let i = 0; i < schemas.length; i += batchSize) {
      const batch = schemas.slice(i, i + batchSize);

      await Promise.all(
        batch.map((schema) =>
          performQuery(
            `DROP SCHEMA IF EXISTS "${schema.schema_name}" CASCADE;`,
            `Dropping schema ${schema.schema_name}...`,
          ),
        ),
      );
    }
    // eslint-disable-next-line no-console
    console.log('All schemas dropped successfully.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error during schema dropping:', err);
  }
}

dropSchemasSequentially();
