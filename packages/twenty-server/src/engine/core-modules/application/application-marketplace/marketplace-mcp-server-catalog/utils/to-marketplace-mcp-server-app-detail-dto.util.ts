import { type MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';
import { MARKETPLACE_MCP_SERVER_CATEGORY } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/to-marketplace-mcp-server-app-dto.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export const toMarketplaceMcpServerAppDetailDTO = (
  marketplaceMcpServer: MarketplaceMcpServer,
): MarketplaceAppDetailDTO => ({
  universalIdentifier: marketplaceMcpServer.universalIdentifier,
  id: marketplaceMcpServer.universalIdentifier,
  name: marketplaceMcpServer.label,
  // Like the built-in clients, a listed MCP server ships no code
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  isListed: true,
  description: marketplaceMcpServer.description,
  aboutDescription: `Add the ${marketplaceMcpServer.label} MCP server so your agents and workflows can use its tools.\n\nTools run on ${marketplaceMcpServer.author}'s server at ${marketplaceMcpServer.url}: agents send it the data each call needs.`,
  author: marketplaceMcpServer.author,
  category: MARKETPLACE_MCP_SERVER_CATEGORY,
  logoUrl: marketplaceMcpServer.logoUrl,
  websiteUrl: marketplaceMcpServer.websiteUrl,
  mcpServerUrl: marketplaceMcpServer.url,
  screenshots: [],
  galleryImages: [],
  installCount: 0,
  requestedCapabilities: [],
  requestedIframeMediaPermissions: [],
  billsCredits: false,
});
