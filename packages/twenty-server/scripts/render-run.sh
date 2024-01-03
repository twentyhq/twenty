#!/bin/sh
export PG_DATABASE_URL=postgres://twenty:twenty@$PG_DATABASE_HOST:$PG_DATABASE_PORT/default
ls -la
ls -la dist
yarn database:setup:prod
node dist/src/main
