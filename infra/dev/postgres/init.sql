-- Create the default database for development
CREATE DATABASE "default";

-- Create the tests database for e2e testing
CREATE DATABASE "test";

-- Create a twenty user
CREATE USER twenty PASSWORD 'twenty';
ALTER USER twenty CREATEDB;

-- Create role for pg_graphql
CREATE ROLE anon;

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

-- Grant permissions to the anon role on schema public
GRANT usage ON SCHEMA public TO anon;
ALTER DEFAULT privileges IN SCHEMA public GRANT all ON tables TO anon;
ALTER DEFAULT privileges IN SCHEMA public GRANT all ON functions TO anon;
ALTER DEFAULT privileges IN SCHEMA public GRANT all ON sequences TO anon;

-- Create the graphql schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "graphql";

-- Grant permissions to the anon role on schema graphql
GRANT usage on SCHEMA graphql TO anon;

ALTER DEFAULT privileges IN SCHEMA graphql GRANT all ON tables TO anon;
ALTER DEFAULT privileges IN SCHEMA graphql GRANT all ON functions TO anon;
ALTER DEFAULT privileges IN SCHEMA graphql GRANT all ON sequences TO anon;

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

GRANT all ON FUNCTION graphql.resolve TO anon;

-- Connect to the "default" database
\c "test";

-- Create the metadata schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "metadata";
GRANT ALL ON SCHEMA metadata TO twenty;

-- Create extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
