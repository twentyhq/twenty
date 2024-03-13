import { useRecoilValue } from 'recoil';

import { ALL_FAVORITES_QUERY_KEY } from '@/prefetch/query-keys/AllFavoritesQueryKey';
import { ALL_VIEWS_QUERY_KEY } from '@/prefetch/query-keys/AllViewsQueryKey';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKeys';

export const usePrefetchedData = (prefetchKey: PrefetchKey) => {
  const isDataPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(prefetchKey),
  );
  const prefetchQueryKey = computeQueryKey(prefetchKey);

  return {
    isDataPrefetched,
    prefetchQueryKey,
  };
};

const computeQueryKey = (prefetchKey: PrefetchKey) => {
  const computedQueryKey =
    prefetchKey === PrefetchKey.AllViews
      ? ALL_VIEWS_QUERY_KEY
      : prefetchKey === PrefetchKey.AllFavorites
        ? ALL_FAVORITES_QUERY_KEY
        : null;

  if (!computedQueryKey) {
    throw new Error(`Unknown prefetch key: ${prefetchKey}`);
  }

  return computedQueryKey;
};
