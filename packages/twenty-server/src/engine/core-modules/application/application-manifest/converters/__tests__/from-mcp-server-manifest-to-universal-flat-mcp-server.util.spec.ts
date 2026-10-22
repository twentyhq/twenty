import { fromMcpServerManifestToUniversalFlatMcpServer } from 'src/engine/core-modules/application/application-manifest/converters/from-mcp-server-manifest-to-universal-flat-mcp-server.util';

const APP_UID = 'a8a8a8a8-a8a8-4a8a-a8a8-a8a8a8a8a8a8';
const MCP_SERVER_UID = '7c1f0a6e-2d3b-4c5d-9e8f-0a1b2c3d4e5f';
const NOW = '2026-10-22T00:00:00.000Z';

describe('fromMcpServerManifestToUniversalFlatMcpServer', () => {
  it('declares an enabled server with no cached tools and no authorization header', () => {
    expect(
      fromMcpServerManifestToUniversalFlatMcpServer({
        mcpServerManifest: {
          universalIdentifier: MCP_SERVER_UID,
          name: 'help_center',
          label: 'Help center',
          url: 'https://docs.twenty.com/mcp',
        },
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      }),
    ).toEqual({
      universalIdentifier: MCP_SERVER_UID,
      applicationUniversalIdentifier: APP_UID,
      name: 'help_center',
      label: 'Help center',
      url: 'https://docs.twenty.com/mcp',
      authorizationHeaderValue: null,
      isEnabled: true,
      tools: [],
      toolsSyncedAt: null,
      toolsSyncError: null,
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    });
  });
});
