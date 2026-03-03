import * as fs from 'fs';
import * as path from 'path';
import { appBuild, appUninstall } from 'twenty-sdk/cli';
import { MetadataApiClient } from 'twenty-sdk/generated';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const APP_PATH = path.resolve(__dirname, '../..');
const TWENTY_API_URL = process.env.TWENTY_API_URL ?? 'http://localhost:3000';
const TWENTY_CONFIG_PATH = process.env.TWENTY_CONFIG_PATH;

const readApiKeyFromConfig = (): string | undefined => {
  if (!TWENTY_CONFIG_PATH || !fs.existsSync(TWENTY_CONFIG_PATH)) {
    return undefined;
  }

  const config = JSON.parse(fs.readFileSync(TWENTY_CONFIG_PATH, 'utf-8'));

  return config.apiKey;
};

const assertServerIsReachable = async () => {
  try {
    const response = await fetch(`${TWENTY_API_URL}/healthz`);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch {
    throw new Error(
      `Twenty server is not reachable at ${TWENTY_API_URL}. ` +
        'Make sure the server is running before executing integration tests.',
    );
  }
};

describe('App installation', () => {
  let appInstalled = false;

  beforeAll(async () => {
    await assertServerIsReachable();

    const buildResult = await appBuild({
      appPath: APP_PATH,
      onProgress: (message: string) => console.log(`[build] ${message}`),
    });

    if (!buildResult.success) {
      throw new Error(
        `App build failed: ${buildResult.error?.message ?? 'Unknown error'}`,
      );
    }

    appInstalled = true;
  });

  afterAll(async () => {
    if (!appInstalled) {
      return;
    }

    const uninstallResult = await appUninstall({ appPath: APP_PATH });

    if (!uninstallResult.success) {
      console.warn(
        `App uninstall failed: ${uninstallResult.error?.message ?? 'Unknown error'}`,
      );
    }
  });

  it('should find the installed app in the applications list', async () => {
    const apiKey = readApiKeyFromConfig();
    const metadataClient = new MetadataApiClient({
      url: `${TWENTY_API_URL}/metadata`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const result = await metadataClient.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    expect(result.findManyApplications.length).toBeGreaterThan(0);
  });
});
