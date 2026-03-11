#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/home/user/twenty}"

cd "$PROJECT_DIR"

# Install dependencies using yarn (Yarn 4 workspace)
# Using yarn install which leverages cached node_modules across container restarts
yarn install

# Ensure nx is available
npx nx --version > /dev/null 2>&1
