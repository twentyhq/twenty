import { type MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { MarketplaceAppKind } from 'src/engine/core-modules/application/application-marketplace/enums/marketplace-app-kind.enum';
import { MARKETPLACE_MCP_SERVER_CATEGORY } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/constants/marketplace-mcp-server-category.constant';
import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';
import { buildMarketplaceMcpServerAboutDescription } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/utils/build-marketplace-mcp-server-about-description.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export const toMarketplaceMcpServerAppDetailDTO = (
  marketplaceMcpServer: MarketplaceMcpServer,
): MarketplaceAppDetailDTO => ({
  universalIdentifier: marketplaceMcpServer.universalIdentifier,
  id: marketplaceMcpServer.universalIdentifier,
  name: marketplaceMcpServer.label,
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  isListed: true,
  kind: MarketplaceAppKind.MCP_SERVER,
  description: marketplaceMcpServer.description,
  aboutDescription:
    buildMarketplaceMcpServerAboutDescription(marketplaceMcpServer),
  author: marketplaceMcpServer.author,
  category: MARKETPLACE_MCP_SERVER_CATEGORY,
  logoUrl: marketplaceMcpServer.logoUrl ?? undefined,
  websiteUrl: marketplaceMcpServer.websiteUrl,
  mcpServerUrl: marketplaceMcpServer.url,
  screenshots: [],
  galleryImages: [],
  installCount: 0,
  requestedCapabilities: [],
  requestedIframeMediaPermissions: [],
  billsCredits: false,
});
