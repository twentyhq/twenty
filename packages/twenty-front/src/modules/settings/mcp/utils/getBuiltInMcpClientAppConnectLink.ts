import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { MCP_SETUP } from '@/settings/mcp/constants/McpSetup';
import {
  buildClaudeInstallLink,
  isHttpsUrl,
} from '@/settings/mcp/utils/mcpSetup';

export const getBuiltInMcpClientAppConnectLink = ({
  builtInMcpClientAppId,
  mcpServerUrl,
}: {
  builtInMcpClientAppId: BuiltInMcpClientApp['id'];
  mcpServerUrl: string;
}): string | undefined => {
  switch (builtInMcpClientAppId) {
    case 'chatgpt':
      return MCP_SETUP.chatGptTwentyAppUrl;
    case 'claude':
      return isHttpsUrl(mcpServerUrl)
        ? buildClaudeInstallLink(mcpServerUrl)
        : undefined;
  }
};
