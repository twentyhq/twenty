#!/bin/sh
export PG_DATABASE_URL=postgres://twenty:twenty@$PG_DATABASE_HOST:$PG_DATABASE_PORT/default
node dist/src/queue-worker/queue-worker
