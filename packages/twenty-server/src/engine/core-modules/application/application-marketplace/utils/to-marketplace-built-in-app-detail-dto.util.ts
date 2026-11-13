import { type MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { type MarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-built-in-application.type';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export const toMarketplaceBuiltInAppDetailDTO = ({
  builtInApplication,
  frontBaseUrl,
}: {
  builtInApplication: MarketplaceBuiltInApplication;
  frontBaseUrl: URL;
}): MarketplaceAppDetailDTO => ({
  universalIdentifier: builtInApplication.universalIdentifier,
  id: builtInApplication.universalIdentifier,
  name: builtInApplication.name,
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  isListed: true,
  description: builtInApplication.description,
  aboutDescription: builtInApplication.aboutDescription,
  author: builtInApplication.author,
  category: builtInApplication.category,
  logoUrl: new URL(builtInApplication.logoPath, frontBaseUrl).toString(),
  websiteUrl: builtInApplication.websiteUrl,
  connectUrl: builtInApplication.connectUrl,
  screenshots: [],
  galleryImages: [
    new URL(builtInApplication.coverImagePath, frontBaseUrl).toString(),
  ],
  installCount: 0,
  requestedCapabilities: [],
  requestedIframeMediaPermissions: [],
  billsCredits: false,
});
