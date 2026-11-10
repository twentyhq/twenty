import { isHttpsUrl } from '@/settings/mcp/utils/mcpSetup';
import { OAUTH_IDENTITY_MCP_SERVER_URL_PLACEHOLDER } from 'twenty-shared/application';

// A web client reaches this server from the internet, so only over HTTPS
export const getConnectableAppConnectLink = ({
  connectUrl,
  mcpServerUrl,
}: {
  connectUrl: string;
  mcpServerUrl: string;
}): string | undefined => {
  if (!connectUrl.includes(OAUTH_IDENTITY_MCP_SERVER_URL_PLACEHOLDER)) {
    return connectUrl;
  }

  if (isHttpsUrl(connectUrl) && !isHttpsUrl(mcpServerUrl)) {
    return undefined;
  }

  return connectUrl.replaceAll(
    OAUTH_IDENTITY_MCP_SERVER_URL_PLACEHOLDER,
    encodeURIComponent(mcpServerUrl),
  );
};
