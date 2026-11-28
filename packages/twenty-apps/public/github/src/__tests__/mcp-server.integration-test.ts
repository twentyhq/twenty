import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';
import { describe, expect, it } from 'vitest';

import githubUserConnection from 'src/connection-providers/github-user-connection';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import githubMcpServer from 'src/mcp-servers/github';

describe('App installation', () => {
  it('registers the GitHub MCP server behind a per-member GitHub sign-in', async () => {
    const client = new MetadataApiClient();

    const { findManyApplications } = await client.query({
      findManyApplications: { id: true, universalIdentifier: true },
    });

    const application = findManyApplications.find(
      (application) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    if (!isDefined(application)) {
      throw new Error('The GitHub application was not installed.');
    }

    const { applicationConnectionProviders } = await client.query({
      applicationConnectionProviders: {
        __args: { applicationId: application.id },
        id: true,
        name: true,
        type: true,
        scope: true,
        oauth: { scopes: true, isClientCredentialsConfigured: true },
      },
    });

    const { mcpServers } = await client.query({
      mcpServers: {
        applicationId: true,
        name: true,
        label: true,
        url: true,
        connectionProviderId: true,
        isActive: true,
      },
    });

    expect(applicationConnectionProviders).toEqual([
      {
        id: expect.any(String),
        name: githubUserConnection.config.name,
        type: 'oauth',
        scope: 'USER',
        oauth: {
          scopes: [],
          isClientCredentialsConfigured: false,
        },
      },
    ]);

    const { name, label, url } = githubMcpServer.config;

    expect(
      mcpServers.filter(
        (mcpServer) => mcpServer.applicationId === application.id,
      ),
    ).toEqual([
      {
        applicationId: application.id,
        name,
        label,
        url,
        connectionProviderId: applicationConnectionProviders[0].id,
        isActive: true,
      },
    ]);
  });
});
