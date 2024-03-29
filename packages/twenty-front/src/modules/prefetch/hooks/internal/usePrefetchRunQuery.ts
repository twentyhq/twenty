import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export type UsePrefetchRunQuery = {
  prefetchKey: PrefetchKey;
};

export const usePrefetchRunQuery = <T extends ObjectRecord>({
  prefetchKey,
}: UsePrefetchRunQuery) => {
  const setPrefetchDataIsLoadedLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(prefetchKey),
  );
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: PREFETCH_CONFIG[prefetchKey].objectNameSingular,
  });

  const { upsertFindManyRecordsQueryInCache } =
    useUpsertFindManyRecordsQueryInCache({
      objectMetadataItem: objectMetadataItem,
    });

  const upsertRecordsInCache = (records: T[]) => {
    upsertFindManyRecordsQueryInCache({
      queryVariables: PREFETCH_CONFIG[prefetchKey].variables,
      depth: PREFETCH_CONFIG[prefetchKey].depth,
      objectRecordsToOverwrite: records,
      computeReferences: false,
    });
    setPrefetchDataIsLoadedLoaded(true);
  };

  return {
    objectMetadataItem,
    setPrefetchDataIsLoadedLoaded,
    upsertRecordsInCache,
  };
};
