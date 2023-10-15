SELECT 'CREATE DATABASE "default"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'default');

SELECT 'CREATE DATABASE "test"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'test');

SELECT 'CREATE USER twenty PASSWORD ''twenty'''
WHERE NOT EXISTS (SELECT FROM pg_user WHERE usename = 'twenty');

SELECT 'ALTER ROLE twenty superuser';
