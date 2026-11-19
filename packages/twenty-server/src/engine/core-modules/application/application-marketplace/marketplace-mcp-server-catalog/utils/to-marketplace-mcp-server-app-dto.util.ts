import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';

export const MARKETPLACE_MCP_SERVER_CATEGORY = 'MCP servers';

export const toMarketplaceMcpServerAppDTO = (
  marketplaceMcpServer: MarketplaceMcpServer,
): MarketplaceAppDTO => ({
  id: marketplaceMcpServer.universalIdentifier,
  name: marketplaceMcpServer.label,
  description: marketplaceMcpServer.description,
  author: marketplaceMcpServer.author,
  category: MARKETPLACE_MCP_SERVER_CATEGORY,
  logoUrl: marketplaceMcpServer.logoUrl,
  mcpServerUrl: marketplaceMcpServer.url,
  isListed: true,
});
