#!/bin/sh
# devbox entrypoint — ordered boot: init → seed → start.
# Lesson (2026-06-13 thaw test): never exec setup concurrently with the
# watch-mode server; `nest start --watch` does `rimraf dist` and races any
# parallel nx invocation over dist/, crash-looping on MODULE_NOT_FOUND.
set -e

echo "[devbox] database init (idempotent migrations)…"
npx nx database:init twenty-server

echo "[devbox] dev seed (tolerated if already seeded)…"
npx nx command-no-deps twenty-server -- workspace:seed:dev || \
  echo "[devbox] seed skipped/failed — assuming already seeded"

echo "[devbox] starting app (server + front; worker runs as a separate instance)…"
# yarn start's queue-worker races the server's watch-compile over dist/ under
# container timing, and concurrently --kill-others then kills the stack.
exec npx nx run-many -t start -p twenty-server twenty-front
