import { testConfig } from '@/cli/__tests__/constants/testConfig';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { beforeAll, afterAll } from 'vitest';

const testConfigDir = path.join(os.tmpdir(), '.twenty-sdk-test');
const testConfigPath = path.join(testConfigDir, 'config.json');

beforeAll(async () => {
  await fs.ensureDir(testConfigDir);

  const configFile = {
    profiles: {
      default: testConfig,
    },
  };

  await fs.writeFile(testConfigPath, JSON.stringify(configFile, null, 2));

  process.env.TWENTY_CONFIG_PATH = testConfigPath;
});

afterAll(async () => {
  delete process.env.TWENTY_CONFIG_PATH;
  await fs.remove(testConfigDir);
});
