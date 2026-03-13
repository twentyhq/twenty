import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application-config';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { appBuild, appUninstall } from 'twenty-sdk/cli';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const APP_PATH = process.cwd();

describe('App installation', () => {
  let appInstalled = false;

  beforeAll(async () => {
    const buildResult = await appBuild({
      appPath: APP_PATH,
      onProgress: (message: string) => console.log(`[build] ${message}`),
    });

    if (!buildResult.success) {
      throw new Error(
        `Build failed: ${buildResult.error?.message ?? 'Unknown error'}`,
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
    const metadataClient = new MetadataApiClient();

    const result = await metadataClient.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const installedApp = result.findManyApplications.find(
      (application: { universalIdentifier: string }) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(installedApp).toBeDefined();
  });
});
