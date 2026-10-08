import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { appDevOnce, appUninstall } from 'twenty-sdk/cli';

const APP_PATH = process.cwd();
const CONFIG_DIR = path.join(os.homedir(), '.twenty');
const TEST_CONFIG_PATH = path.join(CONFIG_DIR, 'config.test.json');
let previousTestConfig: Buffer | undefined;
let isTestConfigWritten = false;

const restoreTestConfig = () => {
  if (!isTestConfigWritten) {
    return;
  }
  if (isDefined(previousTestConfig)) {
    fs.writeFileSync(TEST_CONFIG_PATH, previousTestConfig);
  } else {
    fs.rmSync(TEST_CONFIG_PATH, { force: true });
  }
  isTestConfigWritten = false;
};

function validateEnvironmentOrThrow(): { apiUrl: string; apiKey: string } {
  const apiUrl = process.env.TWENTY_API_URL;
  const apiKey = process.env.TWENTY_API_KEY;

  if (!isNonEmptyString(apiUrl) || !isNonEmptyString(apiKey)) {
    throw new Error(
      'TWENTY_API_URL and TWENTY_API_KEY must be set.\n' +
        'Start a local server: yarn twenty docker:start\n' +
        'Or set them in vitest env config.',
    );
  }

  return { apiUrl, apiKey };
}

async function checkServerOrThrow(apiUrl: string) {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}/healthz`);
  } catch {
    throw new Error(
      `Twenty server is not reachable at ${apiUrl}. ` +
        'Make sure the server is running before executing integration tests.',
    );
  }

  if (!response.ok) {
    throw new Error(`Server at ${apiUrl} returned ${response.status}`);
  }
}

function writeConfig({ apiUrl, apiKey }: { apiUrl: string; apiKey: string }) {
  const payload = JSON.stringify(
    {
      remotes: {
        local: { apiUrl, apiKey },
      },
      defaultRemote: 'local',
    },
    null,
    2,
  );

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  previousTestConfig = fs.existsSync(TEST_CONFIG_PATH)
    ? fs.readFileSync(TEST_CONFIG_PATH)
    : undefined;
  fs.writeFileSync(TEST_CONFIG_PATH, payload);
  isTestConfigWritten = true;
}

export async function setup() {
  const { apiUrl, apiKey } = validateEnvironmentOrThrow();

  await checkServerOrThrow(apiUrl);

  writeConfig({ apiUrl, apiKey });

  try {
    await appUninstall({ appPath: APP_PATH }).catch(() => {});

    const result = await appDevOnce({
      appPath: APP_PATH,
      onProgress: (message: string) => console.log(`[dev] ${message}`),
    });

    if (!result.success) {
      throw new Error(
        `Dev sync failed: ${result.error?.message ?? 'Unknown error'}`,
      );
    }
  } catch (error) {
    restoreTestConfig();
    throw error;
  }
}

export async function teardown() {
  if (!isTestConfigWritten) {
    return;
  }
  try {
    const uninstallResult = await appUninstall({ appPath: APP_PATH });

    if (!uninstallResult.success) {
      console.warn(
        `App uninstall failed: ${uninstallResult.error?.message ?? 'Unknown error'}`,
      );
    }
  } finally {
    restoreTestConfig();
  }
}
