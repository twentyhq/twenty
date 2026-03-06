import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application-config';
import { appBuild, appUninstall } from 'twenty-sdk/cli';
import { MetadataApiClient } from 'twenty-sdk/generated';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const APP_PATH = process.cwd();
const TWENTY_API_URL = process.env.TWENTY_API_URL ?? 'http://localhost:3000';

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
    const apiKey = process.env.TWENTY_TEST_API_KEY;

    if (!apiKey) {
      throw new Error(
        'No API key found. Set TWENTY_TEST_API_KEY in your vitest config env.',
      );
    }

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

    const installedApp = result.findManyApplications.find(
      (application: { universalIdentifier: string }) =>
        application.universalIdentifier ===
        APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(installedApp).toBeDefined();
  });
});
