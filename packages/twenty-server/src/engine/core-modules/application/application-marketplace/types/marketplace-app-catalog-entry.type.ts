import { type APP_LOCALES } from 'twenty-shared/translations';

import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';

export type MarketplaceAppCatalogEntry = MarketplaceAppDTO & {
  translatedTextsByLocale?: Partial<
    Record<
      keyof typeof APP_LOCALES,
      Pick<MarketplaceAppDTO, 'name' | 'description'>
    >
  >;
};
