#!/usr/bin/env node

console.error(`create-twenty-app has been retired. Use the standalone Twenty CLI:

  npm install -g twenty
  twenty app init my-app
  cd my-app
  yarn install
  twenty auth login --url https://your-workspace.twenty.com
  twenty app apply --create

For an existing app, run twenty app dev from its directory.
Keep twenty-sdk installed for application definitions and runtime helpers.`);
process.exitCode = 1;
