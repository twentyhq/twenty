import console from 'console';

import { camelToSnakeCase, connectionSource, performQuery } from './utils';

connectionSource
  .initialize()
  .then(async () => {
    await performQuery(
      'CREATE SCHEMA IF NOT EXISTS "public"',
      'create schema "public"',
    );
    await performQuery(
      'CREATE SCHEMA IF NOT EXISTS "metadata"',
      'create schema "metadata"',
    );
    await performQuery(
      'CREATE SCHEMA IF NOT EXISTS "core"',
      'create schema "core"',
    );
    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "pg_graphql"',
      'create extension pg_graphql',
    );

    await performQuery(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      'create extension "uuid-ossp"',
    );

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

    await performQuery(
      `COMMENT ON SCHEMA "core" IS '@graphql({"inflect_names": true})';`,
      'inflect names for graphql',
    );

    await performQuery(
      `
      DROP FUNCTION IF EXISTS graphql;
      CREATE FUNCTION graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
      )
        returns jsonb
        language sql
        as $$
          select graphql.resolve(
              query := query,
              variables := coalesce(variables, '{}'),
              "operationName" := "operationName",
              extensions := extensions
          );
        $$;
    `,
      'create function graphql',
    );
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
