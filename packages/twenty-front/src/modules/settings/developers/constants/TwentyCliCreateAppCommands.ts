import { doNotTranslate } from 'twenty-shared/i18n';

// A bare `npx twenty` would run the deprecated binary from the app's twenty-sdk
export const TWENTY_CLI_CREATE_APP_COMMANDS = doNotTranslate([
  'npx twenty@latest app init my-app',
  'cd my-app',
  'yarn install',
  'npx twenty@latest app apply --create',
  'npx twenty@latest app dev',
]);
