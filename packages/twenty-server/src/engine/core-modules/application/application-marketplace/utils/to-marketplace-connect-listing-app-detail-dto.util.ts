import { type MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { type MarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-connect-listing.type';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export const toMarketplaceConnectListingAppDetailDTO = ({
  connectListing,
  frontBaseUrl,
}: {
  connectListing: MarketplaceConnectListing;
  frontBaseUrl: URL;
}): MarketplaceAppDetailDTO => ({
  universalIdentifier: connectListing.universalIdentifier,
  id: connectListing.universalIdentifier,
  name: connectListing.name,
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  isListed: true,
  description: connectListing.description,
  aboutDescription: connectListing.aboutDescription,
  author: connectListing.author,
  category: connectListing.category,
  logoUrl: new URL(connectListing.logoPath, frontBaseUrl).toString(),
  websiteUrl: connectListing.websiteUrl,
  connectUrl: connectListing.connectUrl,
  screenshots: [],
  galleryImages: [
    new URL(connectListing.coverImagePath, frontBaseUrl).toString(),
  ],
  installCount: 0,
  requestedCapabilities: [],
  requestedIframeMediaPermissions: [],
  billsCredits: false,
  billingPrices: [],
});
