import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { beforeAll } from 'vitest';

const TEST_CONFIG_DIR = path.join(os.tmpdir(), '.twenty-sdk-test');

beforeAll(() => {
  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });

  const configFile = {
    profiles: {
      default: {
        apiUrl: process.env.TWENTY_API_URL,
        apiKey: process.env.TWENTY_TEST_API_KEY,
      },
    },
  };

  fs.writeFileSync(
    path.join(TEST_CONFIG_DIR, 'config.json'),
    JSON.stringify(configFile, null, 2),
  );
});
