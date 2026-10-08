import { type JestConfigWithTsJest } from 'ts-jest';

import jestIntegrationConfig from './jest-integration.config';

// Secure-deployment integration suite: same harness, but the app boots as a
// production https deployment. SERVER_URL is env-only configuration, so it
// must be set before the app is created in globalSetup; forcing it here keeps
// `nx run twenty-server:test:integration:secure` self-contained.
if (!(process.env.SERVER_URL ?? '').startsWith('https://')) {
  process.env.SERVER_URL = 'https://localhost:3000';
}

const jestConfig: JestConfigWithTsJest = {
  ...jestIntegrationConfig,
  testRegex: 'test/integration/secure-deployment/.*\\.integration-spec\\.ts$',
  testPathIgnorePatterns: [],
};

export default jestConfig;
