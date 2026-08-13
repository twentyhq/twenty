import { FRONT_COMPONENT_SOURCE_CACHE_NAME } from '@/host/component-source/constants/FrontComponentSourceCacheName';

export const openComponentSourceCache = async (): Promise<
  Cache | undefined
> => {
  // Guards stay inside the try block: in Firefox, accessing `caches` in an
  // opaque-origin context throws instead of being undefined.
  try {
    if (typeof caches === 'undefined') {
      return undefined;
    }

    return await caches.open(FRONT_COMPONENT_SOURCE_CACHE_NAME);
  } catch {
    return undefined;
  }
};
