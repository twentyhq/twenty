import console from 'console';

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
      'CREATE SCHEMA IF NOT EXISTS "metadata"',
      'create schema "metadata"',
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
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
