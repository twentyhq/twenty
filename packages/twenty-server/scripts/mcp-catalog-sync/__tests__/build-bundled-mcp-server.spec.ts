import { type McpConnectorDirectoryEntry } from '../types/mcp-connector-directory-entry.type';
import { buildBundledMcpServer } from '../utils/build-bundled-mcp-server.util';

const notionRegistryServer = {
  name: 'com.notion/mcp',
  description: 'Official Notion MCP server',
  remotes: [
    { type: 'sse', url: 'https://mcp.notion.com/sse' },
    { type: 'streamable-http', url: 'https://mcp.notion.com/mcp' },
  ],
};

const buildDirectoryEntry = ({
  directory,
  description,
}: {
  directory: NonNullable<
    McpConnectorDirectoryEntry['_meta']['com.anthropic.api/mcp-registry']
  >;
  description?: string;
}): McpConnectorDirectoryEntry => ({
  server: { name: 'com.notion/mcp', description },
  _meta: { 'com.anthropic.api/mcp-registry': directory },
});

describe('buildBundledMcpServer', () => {
  it('should read label, icon and website from a complete registry entry', () => {
    const result = buildBundledMcpServer({
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
    });
  });

  it('should derive label, website and logo from the registry name when missing', () => {
    const result = buildBundledMcpServer({
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

  it('should take the one-liner from the connector directory', () => {
    const result = buildBundledMcpServer({
      registryServer: notionRegistryServer,
      directoryEntry: buildDirectoryEntry({
        directory: { oneLiner: 'Search and update your Notion workspace' },
      }),
    });

    expect(result).toMatchObject({
      description: 'Search and update your Notion workspace',
    });
  });

  it('should drop directory copy written for another product', () => {
    const result = buildBundledMcpServer({
      registryServer: notionRegistryServer,
      directoryEntry: buildDirectoryEntry({
        directory: { oneLiner: 'Use Notion from Claude' },
        description: 'Organize content directly from Claude.',
      }),
    });

    expect(result).toMatchObject({
      description: 'Official Notion MCP server',
      aboutDescription: null,
    });
  });

  it('should keep the same universal identifier across registry versions', () => {
    expect(
      buildBundledMcpServer({
        registryServer: notionRegistryServer,
        directoryEntry: undefined,
      })?.universalIdentifier,
    ).toBe(
      buildBundledMcpServer({
        registryServer: { ...notionRegistryServer, title: 'Notion' },
        directoryEntry: undefined,
      })?.universalIdentifier,
    );
  });

  it('should name a GitHub-namespaced server after its owner and fall back to the directory remote', () => {
    const result = buildBundledMcpServer({
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

  it('should name the server after its label when the domain only contains it', () => {
    const result = buildBundledMcpServer({
      registryServer: {
        name: 'com.usepylon/mcp',
        title: 'Pylon',
        remotes: [
          { type: 'streamable-http', url: 'https://mcp.usepylon.com/' },
        ],
      },
      directoryEntry: undefined,
    });

    expect(result).toMatchObject({
      name: 'pylon',
      label: 'Pylon',
      author: 'Pylon',
    });
  });

  it('should skip a server that cannot be added in one click', () => {
    expect(
      buildBundledMcpServer({
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
