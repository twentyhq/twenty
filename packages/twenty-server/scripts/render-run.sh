#!/bin/sh
export PG_DATABASE_URL=postgres://twenty:twenty@$PG_DATABASE_HOST:$PG_DATABASE_PORT/default
yarn nx run twenty-server:database:setup
node dist/src/main
