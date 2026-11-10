import { getConnectableAppConnectLink } from '@/settings/app-preferences/utils/getConnectableAppConnectLink';

const CLAUDE_CONNECT_URL =
  'https://claude.ai/customize/connectors?connectorUrl={mcpServerUrl}';

describe('getConnectableAppConnectLink', () => {
  it('links to a connect URL that needs no server URL as is', () => {
    expect(
      getConnectableAppConnectLink({
        connectUrl: 'https://chatgpt.com/apps/twenty',
        mcpServerUrl: 'http://localhost:3000/mcp',
      }),
    ).toBe('https://chatgpt.com/apps/twenty');
  });

  it('fills in the MCP URL of this server', () => {
    expect(
      getConnectableAppConnectLink({
        connectUrl: CLAUDE_CONNECT_URL,
        mcpServerUrl: 'https://api.twenty.com/mcp',
      }),
    ).toBe(
      'https://claude.ai/customize/connectors?connectorUrl=https%3A%2F%2Fapi.twenty.com%2Fmcp',
    );
  });

  it('gives a web client no link when the MCP URL is not HTTPS', () => {
    expect(
      getConnectableAppConnectLink({
        connectUrl: CLAUDE_CONNECT_URL,
        mcpServerUrl: 'http://localhost:3000/mcp',
      }),
    ).toBeUndefined();
  });

  it('lets a desktop client reach a local server', () => {
    expect(
      getConnectableAppConnectLink({
        connectUrl: 'cursor://install?url={mcpServerUrl}',
        mcpServerUrl: 'http://localhost:3000/mcp',
      }),
    ).toBe('cursor://install?url=http%3A%2F%2Flocalhost%3A3000%2Fmcp');
  });
});
