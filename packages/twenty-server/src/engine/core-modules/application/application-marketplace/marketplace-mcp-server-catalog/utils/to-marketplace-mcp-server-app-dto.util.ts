import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceAppKind } from 'src/engine/core-modules/application/application-marketplace/enums/marketplace-app-kind.enum';
import { MARKETPLACE_MCP_SERVER_CATEGORY } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/constants/marketplace-mcp-server-category.constant';
import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';

export const toMarketplaceMcpServerAppDTO = (
  marketplaceMcpServer: Pick<
    MarketplaceMcpServer,
    | 'universalIdentifier'
    | 'label'
    | 'description'
    | 'author'
    | 'logoUrl'
    | 'url'
  >,
): MarketplaceAppDTO => ({
  id: marketplaceMcpServer.universalIdentifier,
  name: marketplaceMcpServer.label,
  description: marketplaceMcpServer.description,
  author: marketplaceMcpServer.author,
  category: MARKETPLACE_MCP_SERVER_CATEGORY,
  logoUrl: marketplaceMcpServer.logoUrl ?? undefined,
  mcpServerUrl: marketplaceMcpServer.url,
  isListed: true,
  kind: MarketplaceAppKind.MCP_SERVER,
});
