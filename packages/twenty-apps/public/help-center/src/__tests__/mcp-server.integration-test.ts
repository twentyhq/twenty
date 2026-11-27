import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';
import { describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import helpCenterMcpServer from 'src/mcp-servers/help-center';

describe('App installation', () => {
  it('registers the public Twenty documentation MCP server', async () => {
    const client = new MetadataApiClient();

    const { findManyApplications } = await client.query({
      findManyApplications: { id: true, universalIdentifier: true },
    });

    const application = findManyApplications.find(
      (application) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    if (!isDefined(application)) {
      throw new Error('The Help Center application was not installed.');
    }

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

    const { name, label, url } = helpCenterMcpServer.config;

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
        connectionProviderId: null,
        isActive: true,
      },
    ]);
  });
});
