import { getConfigPath } from '@/cli/utilities/config/get-config-path';
import * as fs from 'fs-extra';
import * as path from 'path';
import { beforeAll } from 'vitest';

const testConfigPath = getConfigPath();

beforeAll(async () => {
  await fs.ensureDir(path.dirname(testConfigPath));

  const configFile = {
    profiles: {
      default: {
        apiUrl: process.env.TWENTY_API_URL,
        apiKey: process.env.TWENTY_TEST_API_KEY,
      },
    },
  };

  await fs.writeFile(testConfigPath, JSON.stringify(configFile, null, 2));
});
