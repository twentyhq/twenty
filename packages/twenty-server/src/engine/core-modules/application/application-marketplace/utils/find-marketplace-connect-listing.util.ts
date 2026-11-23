import { MARKETPLACE_CONNECT_LISTINGS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-connect-listings.constant';
import { type MarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-connect-listing.type';

export const findMarketplaceConnectListing = (
  universalIdentifier: string,
): MarketplaceConnectListing | undefined =>
  MARKETPLACE_CONNECT_LISTINGS.find(
    (connectListing) =>
      connectListing.universalIdentifier === universalIdentifier.toLowerCase(),
  );
