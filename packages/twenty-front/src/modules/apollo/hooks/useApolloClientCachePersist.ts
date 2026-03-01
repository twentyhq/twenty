import { type InMemoryCache, type NormalizedCacheObject } from '@apollo/client';
import { CachePersistor, LocalStorageWrapper } from 'apollo3-cache-persist';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const CACHE_PERSIST_KEY = 'twenty-apollo-cache';
const CACHE_VERSION_KEY = 'twenty-apollo-cache-version';

export const useApolloClientCachePersist = (cache: InMemoryCache) => {
  const [isRestored, setIsRestored] = useState(false);
  // eslint-disable-next-line twenty/no-state-useref
  const persistorRef = useRef<CachePersistor<NormalizedCacheObject> | null>(
    null,
  );

  useEffect(() => {
    const restoreCache = async () => {
      const persistor = new CachePersistor({
        cache,
        storage: new LocalStorageWrapper(window.localStorage),
        key: CACHE_PERSIST_KEY,
        maxSize: 1048576 * 5, // 5MB
        debug: process.env.NODE_ENV === 'development',
      });

      persistorRef.current = persistor;

      try {
        await persistor.restore();
      } catch {
        // If restore fails, purge and start fresh
        await persistor.purge();
      }

      setIsRestored(true);
    };

    restoreCache();
  }, [cache]);

  const purge = useCallback(async () => {
    if (isDefined(persistorRef.current)) {
      await persistorRef.current.purge();
    }
    localStorage.removeItem(CACHE_PERSIST_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
  }, []);

  return { isRestored, purge };
};
