import { resolve } from 'path';

const FIXTURES_ROOT = resolve(__dirname, '../../../../../twenty-apps/fixtures');

export const RICH_APP_PATH = resolve(FIXTURES_ROOT, 'rich-app');
export const MINIMAL_APP_PATH = resolve(FIXTURES_ROOT, 'minimal-app');
export const INVALID_APP_PATH = resolve(FIXTURES_ROOT, 'invalid-app');
export const FUNCTION_EXECUTE_APP_PATH = resolve(
  FIXTURES_ROOT,
  'function-execute-app',
);
