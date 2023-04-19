CREATE DATABASE twenty;
CREATE DATABASE hasura;

-- From: https://raw.githubusercontent.com/nhost/hasura-auth/main/docker/initdb.d/0001-create-schema.sql
\c twenty;
-- auth schema
CREATE SCHEMA IF NOT EXISTS auth;
-- https://github.com/hasura/graphql-engine/issues/3657
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
declare _new record;
begin _new := new;
_new."updated_at" = now();
return _new;
end;
$$;