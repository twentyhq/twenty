import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';

// isServerVersionCompatible depends on the instance's upgrade state, so it is
// computed at query time and must never be cached with the catalog.
export type MarketplaceCatalogCachedApp = Omit<
  MarketplaceAppDTO,
  'isServerVersionCompatible'
>;
