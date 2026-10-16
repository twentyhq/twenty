import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application-config';
import { runTwenty } from './run-twenty';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('App installation', () => {
  beforeAll(async () => {
    for (const args of [
      ['app', 'publish', '--private'],
      ['app', 'install'],
    ]) {
      const result = await runTwenty(args);
      if (!result.ok) {
        throw new Error(`${args.join(' ')} failed: ${result.error.message}`);
      }
    }
  });

  afterAll(async () => {
    const result = await runTwenty(['app', 'uninstall', '--yes']);
    if (!result.ok) {
      console.warn(`App uninstall failed: ${result.error.message}`);
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
