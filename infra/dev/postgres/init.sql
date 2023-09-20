-- Create extension
CREATE EXTENSION pg_graphql;

create role anon;

grant usage on schema public to anon;
alter default privileges in schema public grant all on tables to anon;
alter default privileges in schema public grant all on functions to anon;
alter default privileges in schema public grant all on sequences to anon;

grant usage on schema graphql to anon;
grant all on function graphql.resolve to anon;

alter default privileges in schema graphql grant all on tables to anon;
alter default privileges in schema graphql grant all on functions to anon;
alter default privileges in schema graphql grant all on sequences to anon;


-- GraphQL Entrypoint
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

-- Create the default database for development
CREATE DATABASE "default";

-- Create the tests database for e2e testing
CREATE DATABASE "test";

-- Create a twenty user
CREATE USER twenty PASSWORD 'twenty';
ALTER USER twenty CREATEDB;

-- Connect to the "default" database
\c "default";

-- Create the metadata schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "metadata";
