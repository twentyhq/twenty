#!/bin/sh
export PG_DATABASE_URL=postgres://twenty:twenty@$PG_DATABASE_HOST:$PG_DATABASE_PORT/default
npx ts-node ./scripts/setup-db.ts && yarn typeorm:migrate && yarn command workspace:seed:dev
node dist/src/main
