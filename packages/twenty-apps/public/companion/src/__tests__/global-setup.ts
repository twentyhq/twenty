import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { appDevOnce, appUninstall } from 'twenty-sdk/cli';

const APP_PATH = process.cwd();
const CONFIG_DIR = path.join(os.homedir(), '.twenty');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.test.json');

const getRemoteConfiguration = (): { apiUrl: string; apiKey: string } => {
  const apiUrl = process.env.TWENTY_API_URL;
  const apiKey = process.env.TWENTY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('TWENTY_API_URL and TWENTY_API_KEY must be set.');
  }

  return { apiUrl, apiKey };
};

export const setup = async () => {
  const { apiUrl, apiKey } = getRemoteConfiguration();
  const response = await fetch(`${apiUrl}/healthz`);

  if (!response.ok) {
    throw new Error(`Twenty returned HTTP ${response.status}`);
  }

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(
      {
        remotes: {
          local: { apiUrl, apiKey, accessToken: apiKey },
        },
        defaultRemote: 'local',
      },
      null,
      2,
    ),
  );

  await appUninstall({ appPath: APP_PATH }).catch(() => {});

  const result = await appDevOnce({ appPath: APP_PATH });

  if (!result.success) {
    throw new Error(
      `Dev sync failed: ${result.error?.message ?? 'Unknown error'}`,
    );
  }
};

export const teardown = async () => {
  try {
    await appUninstall({ appPath: APP_PATH });
  } finally {
    fs.rmSync(CONFIG_PATH, { force: true });
  }
};
