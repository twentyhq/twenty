#!/bin/bash

PG_MAIN_VERSION=15
PG_GRAPHQL_VERSION=1.5.1

current_directory=$(pwd)

echo "Step [1/4]: Installing PostgreSQL..."
brew reinstall postgresql@$PG_MAIN_VERSION

echo "Step [2/4]: Installing GraphQL for PostgreSQL..."
cp ./macos/intel/${PG_MAIN_VERSION}/pg_graphql/${PG_GRAPHQL_VERSION}/pg_graphql--${PG_GRAPHQL_VERSION}.sql \
    /usr/local/opt/postgresql@${PG_MAIN_VERSION}/share/postgresql@${PG_MAIN_VERSION}/extension
cp ./macos/intel/${PG_MAIN_VERSION}/pg_graphql/${PG_GRAPHQL_VERSION}/pg_graphql.control \
    /usr/local/opt/postgresql@${PG_MAIN_VERSION}/share/postgresql@${PG_MAIN_VERSION}/extension
cp ./macos/intel/${PG_MAIN_VERSION}/pg_graphql/${PG_GRAPHQL_VERSION}/pg_graphql.so \
    /usr/local/opt/postgresql@${PG_MAIN_VERSION}/lib/postgresql

export PATH="/usr/local/opt/postgresql@${PG_MAIN_VERSION}/bin:$PATH"

echo  "Step [3/4]: Starting PostgreSQL service..."
brew services restart postgresql@15

echo "Step [4/4]: Setting up database..."
cp ./init.sql /tmp/init.sql
sleep 5
psql -f /tmp/init.sql -d postgres
