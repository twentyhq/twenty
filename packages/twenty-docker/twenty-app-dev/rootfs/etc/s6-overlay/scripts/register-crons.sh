#!/bin/sh
set -e

cd /app/packages/twenty-server

echo "==> START Registering cron jobs"

yarn command:prod cron:trigger:start-cron-trigger
yarn command:prod cron:marketplace-catalog-sync
yarn command:prod cron:app-version-check
yarn command:prod cron:stale-registration-cleanup

echo "==> DONE"
