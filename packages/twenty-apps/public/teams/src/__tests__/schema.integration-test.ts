import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TEAMS_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
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

  it('installs the Teams assistant agent bound to a role that grants nothing', async () => {
    const client = new MetadataApiClient();

    const { findManyAgents } = await client.query({
      findManyAgents: { name: true, roleId: true },
    });

    const agent = findManyAgents.find(
      (agent) => agent.name === 'teams-assistant',
    );

    if (!isDefined(agent)) {
      throw new Error('The Teams assistant agent was not installed.');
    }

    const { getRoles } = await client.query({
      getRoles: {
        id: true,
        universalIdentifier: true,
        canBeAssignedToAgents: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canUpdateAllSettings: true,
        objectPermissions: { objectMetadataId: true },
        permissionFlags: { id: true },
      },
    });

    const role = getRoles.find((role) => role.id === agent.roleId);

    expect(role).toEqual(
      expect.objectContaining({
        universalIdentifier: TEAMS_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
        canBeAssignedToAgents: true,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canUpdateAllSettings: false,
      }),
    );
    expect(role?.objectPermissions ?? []).toHaveLength(0);
    expect(role?.permissionFlags ?? []).toHaveLength(0);
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
