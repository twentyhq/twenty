import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { type MarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-built-in-application.type';

export const toMarketplaceBuiltInAppDTO = ({
  builtInApplication,
  frontBaseUrl,
}: {
  builtInApplication: MarketplaceBuiltInApplication;
  frontBaseUrl: URL;
}): MarketplaceAppDTO => ({
  id: builtInApplication.universalIdentifier,
  name: builtInApplication.name,
  description: builtInApplication.description,
  author: builtInApplication.author,
  category: builtInApplication.category,
  logoUrl: new URL(builtInApplication.logoPath, frontBaseUrl).toString(),
  connectUrl: builtInApplication.connectUrl,
  isListed: true,
});
