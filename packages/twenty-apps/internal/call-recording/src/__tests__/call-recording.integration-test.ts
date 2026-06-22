import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';

describe('App installation', () => {
  it('should find the installed Call recording app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const matchingApplication = result.findManyApplications.find(
      (application: { name: string }) =>
        application.name === applicationConfig.config.displayName,
    );

    expect(matchingApplication).toBeDefined();
  });
});
