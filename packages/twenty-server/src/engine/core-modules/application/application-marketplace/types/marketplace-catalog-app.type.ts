import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';

export type MarketplaceCatalogApp = MarketplaceAppDTO & {
  attributedClientIdMetadataDocumentUrls?: string[];
};
