import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { camelToSnakeCase, performQuery } from './utils';

rawDataSource
  .initialize()
  .then(async () => {
    await performQuery(
      'CREATE SCHEMA IF NOT EXISTS "public"',
      'create schema "public"',
    );
    await performQuery(
      'CREATE SCHEMA IF NOT EXISTS "core"',
      'create schema "core"',
    );

    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      'create extension "uuid-ossp"',
    );

    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "unaccent"',
      'create extension "unaccent"',
    );

    await performQuery(
      `CREATE OR REPLACE FUNCTION public.unaccent_immutable(input text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
AS $$
SELECT public.unaccent('public.unaccent'::regdictionary, input)
$$;`,
      'create immutable unaccent wrapper function',
    );

    // We paused the work on FDW
    if (process.env.IS_FDW_ENABLED !== 'true') {
      return;
    }

    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "postgres_fdw"',
      'create extension "postgres_fdw"',
    );

    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "wrappers"',
      'create extension "wrappers"',
    );

    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "mysql_fdw"',
      'create extension "mysql_fdw"',
    );

    const supabaseWrappers = [
      'airtable',
      'bigQuery',
      'clickHouse',
      'firebase',
      'logflare',
      's3',
      'stripe',
    ]; // See https://supabase.github.io/wrappers/

    for (const wrapper of supabaseWrappers) {
      if (await checkForeignDataWrapperExists(`${wrapper.toLowerCase()}_fdw`)) {
        continue;
      }
      await performQuery(
        `
          CREATE FOREIGN DATA WRAPPER "${wrapper.toLowerCase()}_fdw"
          HANDLER "${camelToSnakeCase(wrapper)}_fdw_handler"
          VALIDATOR "${camelToSnakeCase(wrapper)}_fdw_validator";
          `,
        `create ${wrapper} "wrappers"`,
        true,
        true,
      );
    }
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error during Data Source initialization:', err);
  });

async function checkForeignDataWrapperExists(
  wrapperName: string,
): Promise<boolean> {
  const result = await rawDataSource.query(
    `SELECT 1 FROM pg_foreign_data_wrapper WHERE fdwname = $1`,
    [wrapperName],
  );

  return result.length > 0;
}
