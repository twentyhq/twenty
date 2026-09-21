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

  it('should deploy the List My Teams Transcripts function', async () => {
    const result = await new MetadataApiClient().query({
      findManyLogicFunctions: { name: true },
    });

    expect(
      result.findManyLogicFunctions.map((logicFunction) => logicFunction.name),
    ).toContain('teams-list-organizer-transcripts');
  });
});
