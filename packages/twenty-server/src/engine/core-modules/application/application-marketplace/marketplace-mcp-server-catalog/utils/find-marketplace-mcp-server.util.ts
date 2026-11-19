import { MARKETPLACE_MCP_SERVERS } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/constants/marketplace-mcp-servers.constant';
import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';

export const findMarketplaceMcpServer = (
  universalIdentifier: string,
): MarketplaceMcpServer | undefined =>
  MARKETPLACE_MCP_SERVERS.find(
    (marketplaceMcpServer) =>
      marketplaceMcpServer.universalIdentifier ===
      universalIdentifier.toLowerCase(),
  );
