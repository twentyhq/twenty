import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { appBuild, appDeploy, appInstall, appUninstall } from 'twenty-sdk/cli';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const APP_PATH = process.cwd();

describe('App installation', () => {
  beforeAll(async () => {
    const buildResult = await appBuild({
      appPath: APP_PATH,
      tarball: true,
      onProgress: (message: string) => console.log(`[build] ${message}`),
    });

    if (!buildResult.success) {
      throw new Error(
        `Build failed: ${buildResult.error?.message ?? 'Unknown error'}`,
      );
    }

    const deployResult = await appDeploy({
      tarballPath: buildResult.data.tarballPath!,
      onProgress: (message: string) => console.log(`[deploy] ${message}`),
    });

    if (!deployResult.success) {
      throw new Error(
        `Deploy failed: ${deployResult.error?.message ?? 'Unknown error'}`,
      );
    }

    const installResult = await appInstall({ appPath: APP_PATH });

    if (!installResult.success) {
      throw new Error(
        `Install failed: ${installResult.error?.message ?? 'Unknown error'}`,
      );
    }
  });

  afterAll(async () => {
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
