#!/bin/sh
export PG_DATABASE_URL=postgres://postgres:postgres@$PG_DATABASE_HOST:$PG_DATABASE_PORT/default
node dist/queue-worker/queue-worker
