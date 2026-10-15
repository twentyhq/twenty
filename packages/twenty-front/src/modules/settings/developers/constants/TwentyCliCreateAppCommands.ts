// Apps depend on twenty-sdk, whose deprecated `twenty` binary shadows the
// standalone CLI for a bare `npx twenty` inside the app folder.
export const TWENTY_CLI_CREATE_APP_COMMANDS = [
  'npx twenty@latest app init my-app',
  'cd my-app',
  'yarn install',
  'npx twenty@latest app apply --create',
  'npx twenty@latest app dev',
];
