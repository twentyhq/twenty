import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { beforeAll } from 'vitest';

const TWENTY_API_URL = process.env.TWENTY_API_URL ?? 'http://localhost:3000';
const TEST_CONFIG_DIR = path.join(os.tmpdir(), '.twenty-sdk-test');

const assertServerIsReachable = async () => {
  let response: Response;

  try {
    response = await fetch(`${TWENTY_API_URL}/healthz`);
  } catch {
    throw new Error(
      `Twenty server is not reachable at ${TWENTY_API_URL}. ` +
        'Make sure the server is running before executing integration tests.',
    );
  }

  if (!response.ok) {
    throw new Error(`Server at ${TWENTY_API_URL} returned ${response.status}`);
  }
};

beforeAll(async () => {
  await assertServerIsReachable();

  fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });

  const configFile = {
    remotes: {
      local: {
        apiUrl: process.env.TWENTY_API_URL,
        apiKey: process.env.TWENTY_API_KEY,
      },
    },
    defaultRemote: 'local',
  };

  fs.writeFileSync(
    path.join(TEST_CONFIG_DIR, 'config.json'),
    JSON.stringify(configFile, null, 2),
  );
});
