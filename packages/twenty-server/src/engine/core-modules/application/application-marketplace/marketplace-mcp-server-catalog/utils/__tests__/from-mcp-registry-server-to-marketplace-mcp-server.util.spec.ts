import { fromMcpRegistryServerToMarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/from-mcp-registry-server-to-marketplace-mcp-server.util';

describe('fromMcpRegistryServerToMarketplaceMcpServer', () => {
  it('should read label, icon and website from a complete registry entry', () => {
    const result = fromMcpRegistryServerToMarketplaceMcpServer({
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
      remotes: [{ type: 'streamable-http', url: 'https://mcp.linear.app/mcp' }],
    });

    expect(result).toMatchObject({
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
    const result = fromMcpRegistryServerToMarketplaceMcpServer({
      name: 'com.notion/mcp',
      description: 'Official Notion MCP server',
      remotes: [
        { type: 'sse', url: 'https://mcp.notion.com/sse' },
        { type: 'streamable-http', url: 'https://mcp.notion.com/mcp' },
      ],
    });

    expect(result).toMatchObject({
      name: 'notion',
      label: 'Notion',
      websiteUrl: 'https://notion.com',
      logoUrl: 'https://twenty-icons.com/notion.com',
      url: 'https://mcp.notion.com/mcp',
    });
  });

  it('should keep the same universal identifier across registry versions', () => {
    const remotes = [
      { type: 'streamable-http', url: 'https://mcp.notion.com/mcp' },
    ];

    expect(
      fromMcpRegistryServerToMarketplaceMcpServer({
        name: 'com.notion/mcp',
        remotes,
      })?.universalIdentifier,
    ).toBe(
      fromMcpRegistryServerToMarketplaceMcpServer({
        name: 'com.notion/mcp',
        title: 'Notion',
        remotes,
      })?.universalIdentifier,
    );
  });

  it('should skip a server that cannot be added in one click', () => {
    expect(
      fromMcpRegistryServerToMarketplaceMcpServer({
        name: 'ai.smithery/notion',
        remotes: [
          {
            type: 'streamable-http',
            url: 'https://server.smithery.ai/notion/mcp',
            headers: [{ name: 'Authorization' }],
          },
        ],
      }),
    ).toBeUndefined();
  });
});
