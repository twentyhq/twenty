import console from 'console';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { performQuery } from './utils';

async function dropSchemasSequentially() {
  try {
    await rawDataSource.initialize();

    // Fetch all schemas
    const schemas = await performQuery(
      `
      SELECT n.nspname AS "schema_name"
      FROM pg_catalog.pg_namespace n
      WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
    `,
      'Fetching schemas...',
    );

    // Iterate over each schema and drop it
    // This is to avoid dropping all schemas at once, which would cause an out of shared memory error
    for (const schema of schemas) {
      await performQuery(
        `
        DROP SCHEMA IF EXISTS "${schema.schema_name}" CASCADE;
      `,
        `Dropping schema ${schema.schema_name}...`,
      );
    }

    console.log('All schemas dropped successfully.');
  } catch (err) {
    console.error('Error during schema dropping:', err);
  }
}

dropSchemasSequentially();
