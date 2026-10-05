import { FRONT_COMPONENT_SOURCE_CACHE_NAME } from '@/host/component-source/constants/FrontComponentSourceCacheName';

export const openComponentSourceCache = async (): Promise<
  Cache | undefined
> => {
  try {
    if (typeof caches === 'undefined') {
      return undefined;
    }

    return await caches.open(FRONT_COMPONENT_SOURCE_CACHE_NAME);
  } catch {
    return undefined;
  }
};
