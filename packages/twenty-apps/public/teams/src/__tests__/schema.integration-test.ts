import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

describe('App installation', () => {
  it('deploys the List My Teams Transcripts function', async () => {
    const result = await new MetadataApiClient().query({
      findManyLogicFunctions: { name: true },
    });

    expect(
      result.findManyLogicFunctions.map((logicFunction) => logicFunction.name),
    ).toContain('teams-list-organizer-transcripts');
  });

  it('registers Microsoft OAuth under Teams without configured credentials', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const application = result.findManyApplications.find(
      (application) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    if (!isDefined(application)) {
      throw new Error('The Microsoft Teams application was not installed.');
    }

    const { applicationConnectionProviders } = await client.query({
      applicationConnectionProviders: {
        __args: { applicationId: application.id },
        applicationId: true,
        name: true,
        displayName: true,
        type: true,
        oauth: {
          scopes: true,
          isClientCredentialsConfigured: true,
        },
      },
    });

    expect(applicationConnectionProviders).toEqual([
      {
        applicationId: application.id,
        name: 'microsoft-teams',
        displayName: 'Microsoft Teams',
        type: 'oauth',
        oauth: {
          scopes: expect.arrayContaining([
            'offline_access',
            'https://graph.microsoft.com/OnlineMeetingTranscript.Read.All',
          ]),
          isClientCredentialsConfigured: false,
        },
      },
    ]);
  });
});
