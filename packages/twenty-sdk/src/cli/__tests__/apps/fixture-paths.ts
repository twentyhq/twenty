import { resolve } from 'path';

const FIXTURES_ROOT = resolve(__dirname, '../../../../../twenty-apps/fixtures');
const TWENTY_APPS_ROOT = resolve(__dirname, '../../../../../twenty-apps');

export const POSTCARD_APP_PATH = resolve(FIXTURES_ROOT, 'postcard-app');
export const MINIMAL_APP_PATH = resolve(FIXTURES_ROOT, 'minimal-app');
export const INVALID_APP_PATH = resolve(FIXTURES_ROOT, 'invalid-app');
export const FUNCTION_EXECUTE_APP_PATH = resolve(
  FIXTURES_ROOT,
  'function-execute-app',
);
export const HELLO_WORLD_APP_PATH = resolve(TWENTY_APPS_ROOT, 'hello-world');
