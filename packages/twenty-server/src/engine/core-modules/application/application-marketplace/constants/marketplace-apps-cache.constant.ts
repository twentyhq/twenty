import { isDefined } from 'twenty-shared/utils';

export const MARKETPLACE_APPS_CACHE_TTL_MS = 5 * 60 * 1000;

const MARKETPLACE_APPS_CACHE_KEY_PREFIX = 'apps';

export const getMarketplaceAppsCacheKey = (isFeatured?: boolean): string =>
  isDefined(isFeatured)
    ? `${MARKETPLACE_APPS_CACHE_KEY_PREFIX}:featured:${isFeatured}`
    : `${MARKETPLACE_APPS_CACHE_KEY_PREFIX}:all`;

export const MARKETPLACE_APPS_CACHE_KEYS = [
  getMarketplaceAppsCacheKey(),
  getMarketplaceAppsCacheKey(true),
  getMarketplaceAppsCacheKey(false),
];
