-- Create table "default" for local setup without docker 
SELECT 'CREATE DATABASE "default"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'default')\gexec

-- Create user "twenty" for local setup without docker
SELECT 'CREATE USER twenty PASSWORD ''twenty'''
WHERE NOT EXISTS (SELECT FROM pg_user WHERE usename = 'twenty')\gexec

-- Inflect names for pg_graphql
COMMENT ON SCHEMA "public" IS '@graphql({"inflect_names": true})';

-- Connect to the "default" database
\c "default";

-- Create extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the tests database for e2e testing
CREATE DATABASE "test";

-- Connect to the "test" database for e2e testing
\c "test";
