import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { type MarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-connect-listing.type';

export const toMarketplaceConnectListingAppDTO = ({
  connectListing,
  frontBaseUrl,
}: {
  connectListing: Pick<
    MarketplaceConnectListing,
    | 'universalIdentifier'
    | 'name'
    | 'description'
    | 'author'
    | 'category'
    | 'logoPath'
    | 'connectUrl'
  >;
  frontBaseUrl: URL;
}): MarketplaceAppDTO => ({
  id: connectListing.universalIdentifier,
  name: connectListing.name,
  description: connectListing.description,
  author: connectListing.author,
  category: connectListing.category,
  logoUrl: new URL(connectListing.logoPath, frontBaseUrl).toString(),
  connectUrl: connectListing.connectUrl,
  isListed: true,
  hasMcpServers: false,
});
