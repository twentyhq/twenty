import { fileURLToPath } from 'node:url';

export const MINIMAL_APP_PATH = fileURLToPath(
  new URL('../../../../../twenty-apps/fixtures/minimal-app', import.meta.url),
);
