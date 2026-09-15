import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const app = result.findManyApplications.find(
      (application: { universalIdentifier: string }) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(app).toBeDefined();
  });
});

describe('CoreApiClient', () => {
  it('can read its own ownership and processing fields on standard recordings', async () => {
    const client = new CoreApiClient();

    const result = await client.query({
      callRecordings: {
        __args: { first: 1 },
        edges: {
          node: {
            id: true,
            companionSession: true,
            companionFailureReason: true,
            companionImportClaimedAt: true,
          },
        },
      },
    });
    expect(result.callRecordings?.edges).toBeDefined();
  });
});
