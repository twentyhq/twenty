import { MCP_SETUP } from '@/settings/mcp/constants/McpSetup';
import { getBuiltInMcpClientAppConnectLink } from '@/settings/mcp/utils/getBuiltInMcpClientAppConnectLink';
import { buildClaudeInstallLink } from '@/settings/mcp/utils/mcpSetup';

describe('getBuiltInMcpClientAppConnectLink', () => {
  it('links ChatGPT to the official Twenty app whatever the server URL', () => {
    expect(
      getBuiltInMcpClientAppConnectLink({
        builtInMcpClientAppId: 'chatgpt',
        mcpServerUrl: 'http://localhost:3000/mcp',
      }),
    ).toBe(MCP_SETUP.chatGptTwentyAppUrl);
  });

  it('links Claude to its connector setup with the MCP URL prefilled', () => {
    const mcpServerUrl = 'https://api.twenty.com/mcp';

    expect(
      getBuiltInMcpClientAppConnectLink({
        builtInMcpClientAppId: 'claude',
        mcpServerUrl,
      }),
    ).toBe(buildClaudeInstallLink(mcpServerUrl));
  });

  it('gives Claude no link when the MCP URL is not HTTPS', () => {
    expect(
      getBuiltInMcpClientAppConnectLink({
        builtInMcpClientAppId: 'claude',
        mcpServerUrl: 'http://localhost:3000/mcp',
      }),
    ).toBeUndefined();
  });
});
