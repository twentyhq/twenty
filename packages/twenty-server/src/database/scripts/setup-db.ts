import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { camelToSnakeCase, performQuery } from './setup-db-utils';

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

    // Managed Postgres (e.g. Supabase) pre-installs uuid-ossp in a non-public schema,
    // leaving public.uuid_generate_v4() — which per-workspace table DDL depends on —
    // undefined. Provide it (no-op when it already exists), backed by core gen_random_uuid().
    await performQuery(
      `DO $$
BEGIN
  IF to_regprocedure('public.uuid_generate_v4()') IS NULL THEN
    EXECUTE 'CREATE FUNCTION public.uuid_generate_v4() RETURNS uuid LANGUAGE sql VOLATILE AS $f$ SELECT gen_random_uuid() $f$';
  END IF;
END $$;`,
      'ensure public.uuid_generate_v4() exists',
    );

    // WITH SCHEMA public so the unaccent_immutable wrapper below (which references
    // public.unaccent) resolves on managed Postgres where extensions may default elsewhere.
    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public',
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
    // oxlint-disable-next-line no-console
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
