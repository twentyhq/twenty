import { buildMcpServerUrl } from '@/settings/mcp/utils/mcpSetup';
import { MARKETPLACE_APP_MCP_SERVER_URL_PLACEHOLDER } from 'twenty-shared/application';

export const getMarketplaceAppConnectLink = ({
  connectUrl,
  serverBaseUrl,
}: {
  connectUrl: string;
  serverBaseUrl: string;
}) =>
  connectUrl.replace(
    MARKETPLACE_APP_MCP_SERVER_URL_PLACEHOLDER,
    encodeURIComponent(buildMcpServerUrl(serverBaseUrl)),
  );
