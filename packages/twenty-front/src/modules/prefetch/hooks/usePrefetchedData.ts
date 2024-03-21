import { useRecoilValue } from 'recoil';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const usePrefetchedData = <T extends ObjectRecord>(
  prefetchKey: PrefetchKey,
) => {
  const isDataPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(prefetchKey),
  );
  const prefetchQueryKey = PREFETCH_CONFIG[prefetchKey];

  const { records } = useFindManyRecords<T>({
    skip: !isDataPrefetched,
    ...prefetchQueryKey,
  });

  return {
    isDataPrefetched,
    records,
  };
};
