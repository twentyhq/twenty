import { type JestConfigWithTsJest } from 'ts-jest';

import baseConfig from './jest-integration.config';
import { discoverBullmqSpecs } from './test/integration/utils/bullmq-opt-in-specs';

// This suite exercises the REAL awaited BullMQ driver. Force it on regardless
// of how jest is invoked; every other integration spec uses the inline
// SyncDriver (see jest-integration.config.ts). .env.test no longer sets this,
// so the assignment is not clobbered by dotenv override.
process.env.MESSAGE_QUEUE_TYPE = 'bull-mq';

// testRegex and testMatch are mutually exclusive — drop the inherited regex.
const { testRegex: _inheritedTestRegex, ...sharedConfig } = baseConfig;

const bullmqJestConfig: JestConfigWithTsJest = {
  ...sharedConfig,
  testMatch: discoverBullmqSpecs().map((specPath) => `<rootDir>/${specPath}`),
  testPathIgnorePatterns: ['<rootDir>/dist'],
};

export default bullmqJestConfig;
