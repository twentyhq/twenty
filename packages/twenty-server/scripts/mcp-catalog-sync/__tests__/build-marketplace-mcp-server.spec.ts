import { type McpConnectorDirectoryEntry } from '../types/mcp-connector-directory-entry.type';
import { buildMarketplaceMcpServer } from '../utils/build-marketplace-mcp-server.util';

const notionRegistryServer = {
  name: 'com.notion/mcp',
  description: 'Official Notion MCP server',
  remotes: [
    { type: 'sse', url: 'https://mcp.notion.com/sse' },
    { type: 'streamable-http', url: 'https://mcp.notion.com/mcp' },
  ],
};

const buildDirectoryEntry = (
  meta: NonNullable<
    McpConnectorDirectoryEntry['_meta']['com.anthropic.api/mcp-registry']
  >,
  description?: string,
): McpConnectorDirectoryEntry => ({
  server: { name: 'com.notion/mcp', description },
  _meta: { 'com.anthropic.api/mcp-registry': meta },
});

describe('buildMarketplaceMcpServer', () => {
  it('should read label, icon and website from a complete registry entry', () => {
    const result = buildMarketplaceMcpServer({
      registryServer: {
        name: 'app.linear/linear',
        title: 'Linear',
        description: 'Find and manage issues.',
        websiteUrl: 'https://linear.app',
        icons: [
          {
            src: 'https://static.linear.app/icon.svg',
            mimeType: 'image/svg+xml',
          },
          { src: 'https://static.linear.app/icon.png', mimeType: 'image/png' },
        ],
        remotes: [
          { type: 'streamable-http', url: 'https://mcp.linear.app/mcp' },
        ],
      },
      directoryEntry: undefined,
    });

    expect(result).toMatchObject({
      registryName: 'app.linear/linear',
      name: 'linear',
      label: 'Linear',
      author: 'Linear',
      description: 'Find and manage issues.',
      websiteUrl: 'https://linear.app',
      logoUrl: 'https://static.linear.app/icon.png',
      url: 'https://mcp.linear.app/mcp',
      toolNames: [],
      isReadOnly: null,
    });
  });

  it('should derive label, website and logo from the registry name when missing', () => {
    const result = buildMarketplaceMcpServer({
      registryServer: notionRegistryServer,
      directoryEntry: undefined,
    });

    expect(result).toMatchObject({
      name: 'notion',
      label: 'Notion',
      websiteUrl: 'https://notion.com',
      logoUrl: 'https://twenty-icons.com/notion.com',
      url: 'https://mcp.notion.com/mcp',
    });
  });

  it('should take the one-liner, tools and access from the connector directory', () => {
    const result = buildMarketplaceMcpServer({
      registryServer: notionRegistryServer,
      directoryEntry: buildDirectoryEntry({
        oneLiner: 'Search and update your Notion workspace',
        toolNames: ['search', 'fetch'],
        permissions: 'Read and write',
      }),
    });

    expect(result).toMatchObject({
      description: 'Search and update your Notion workspace',
      toolNames: ['search', 'fetch'],
      isReadOnly: false,
    });
  });

  it('should drop directory copy written for another product', () => {
    const result = buildMarketplaceMcpServer({
      registryServer: notionRegistryServer,
      directoryEntry: buildDirectoryEntry(
        { oneLiner: 'Use Notion from Claude', permissions: 'Read only' },
        'Organize content directly from Claude.',
      ),
    });

    expect(result).toMatchObject({
      description: 'Official Notion MCP server',
      aboutDescription: null,
      isReadOnly: true,
    });
  });

  it('should keep the same universal identifier across registry versions', () => {
    expect(
      buildMarketplaceMcpServer({
        registryServer: notionRegistryServer,
        directoryEntry: undefined,
      })?.universalIdentifier,
    ).toBe(
      buildMarketplaceMcpServer({
        registryServer: { ...notionRegistryServer, title: 'Notion' },
        directoryEntry: undefined,
      })?.universalIdentifier,
    );
  });

  it('should name a GitHub-namespaced server after its owner and fall back to the directory remote', () => {
    const result = buildMarketplaceMcpServer({
      registryServer: {
        name: 'io.github.PostHog/mcp',
        remotes: [
          {
            type: 'streamable-http',
            url: 'https://mcp.posthog.com/mcp',
            headers: [{ name: 'Authorization' }],
          },
        ],
      },
      directoryEntry: {
        server: {
          name: 'io.github.PostHog/mcp',
          remotes: [
            { type: 'streamable-http', url: 'https://mcp.posthog.com/mcp' },
          ],
        },
        _meta: {
          'com.anthropic.api/mcp-registry': {
            displayName: 'PostHog',
            author: { url: 'https://posthog.com' },
          },
        },
      },
    });

    expect(result).toMatchObject({
      name: 'posthog',
      label: 'PostHog',
      author: 'PostHog',
      websiteUrl: 'https://posthog.com',
      url: 'https://mcp.posthog.com/mcp',
    });
  });

  it('should skip a server that cannot be added in one click', () => {
    expect(
      buildMarketplaceMcpServer({
        registryServer: {
          name: 'ai.smithery/notion',
          remotes: [
            {
              type: 'streamable-http',
              url: 'https://server.smithery.ai/notion/mcp',
              headers: [{ name: 'Authorization' }],
            },
          ],
        },
        directoryEntry: undefined,
      }),
    ).toBeUndefined();
  });
});
