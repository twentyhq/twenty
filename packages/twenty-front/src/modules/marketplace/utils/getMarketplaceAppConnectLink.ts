import { buildMcpServerUrl } from '@/settings/mcp/utils/mcpSetup';

const MCP_SERVER_URL_PLACEHOLDER = '{mcpServerUrl}';

export const getMarketplaceAppConnectLink = ({
  connectUrl,
  serverBaseUrl,
}: {
  connectUrl: string;
  serverBaseUrl: string;
}) =>
  connectUrl.replace(
    MCP_SERVER_URL_PLACEHOLDER,
    encodeURIComponent(buildMcpServerUrl(serverBaseUrl)),
  );
