import { MARKETPLACE_BUILT_IN_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-applications.constant';
import { type MarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-built-in-application.type';

export const findMarketplaceBuiltInApplication = (
  universalIdentifier: string,
): MarketplaceBuiltInApplication | undefined =>
  MARKETPLACE_BUILT_IN_APPLICATIONS.find(
    (builtInApplication) =>
      builtInApplication.universalIdentifier ===
      universalIdentifier.toLowerCase(),
  );
