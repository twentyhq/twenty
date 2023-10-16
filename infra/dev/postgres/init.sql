SELECT 'CREATE DATABASE "default"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'default')\gexec

SELECT 'CREATE DATABASE "test"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'test')\gexec

SELECT 'CREATE USER twenty PASSWORD ''twenty'''
WHERE NOT EXISTS (SELECT FROM pg_user WHERE usename = 'twenty')\gexec

SELECT 'ALTER ROLE twenty superuser'\gexec
