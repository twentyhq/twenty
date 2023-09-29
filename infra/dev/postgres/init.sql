-- Inflect names for pg_graphql
COMMENT ON SCHEMA "public" IS '@graphql({"inflect_names": true})';

-- Connect to the "default" database
\c "default";

-- Create extension
CREATE EXTENSION IF NOT EXISTS pg_graphql;

-- Create the metadata schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "metadata";
GRANT ALL ON SCHEMA metadata TO twenty;

-- Create extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create GraphQL Entrypoint
create function graphql(
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

-- Create the tests database for e2e testing
CREATE DATABASE "test";

-- Connect to the "test" database for e2e testing
\c "test";

-- Create the metadata schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "metadata";
GRANT ALL ON SCHEMA metadata TO twenty;

-- Create extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
