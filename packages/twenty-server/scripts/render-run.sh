#!/bin/sh
export PG_DATABASE_URL=postgres://twenty:twenty@$PG_DATABASE_HOST:$PG_DATABASE_PORT/default
yarn database:setup:prod
node dist/src/main
