import { useRecoilValue } from 'recoil';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ALL_FAVORITES_QUERY_KEY } from '@/prefetch/query-keys/AllFavoritesQueryKey';
import { ALL_VIEWS_QUERY_KEY } from '@/prefetch/query-keys/AllViewsQueryKey';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKeys';

export const usePrefetchedData = <T extends ObjectRecord>(
  prefetchKey: PrefetchKey,
) => {
  const isDataPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(prefetchKey),
  );
  const prefetchQueryKey = computeQueryKey(prefetchKey);

  const { records } = useFindManyRecords<T>({
    skip: !isDataPrefetched,
    ...prefetchQueryKey,
    useRecordsWithoutConnection: true,
  });

  return {
    isDataPrefetched,
    records,
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
