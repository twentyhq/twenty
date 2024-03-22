import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { ALL_VIEWS_QUERY_KEY } from '@/prefetch/query-keys/AllViewsQueryKey';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export type UsePrefetchRunQuery = {
  prefetchKey: PrefetchKey;
  objectNameSingular: CoreObjectNameSingular;
};

export const usePrefetchRunQuery = <T extends ObjectRecord>({
  prefetchKey,
  objectNameSingular,
}: UsePrefetchRunQuery) => {
  const setPrefetchDataIsLoadedLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(prefetchKey),
  );
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular,
  });

  const { upsertFindManyRecordsQueryInCache } =
    useUpsertFindManyRecordsQueryInCache({
      objectMetadataItem: objectMetadataItem,
    });

  const mapConnectionToRecords = useMapConnectionToRecords();

  const upsertRecordsInCache = (records: ObjectRecordConnection<T>) => {
    upsertFindManyRecordsQueryInCache({
      queryVariables: ALL_VIEWS_QUERY_KEY.variables,
      depth: ALL_VIEWS_QUERY_KEY.depth,
      objectRecordsToOverwrite:
        mapConnectionToRecords({
          objectRecordConnection: records,
          objectNameSingular: CoreObjectNameSingular.View,
          depth: 2,
        }) ?? [],
    });
    setPrefetchDataIsLoadedLoaded(true);
  };

  return {
    objectMetadataItem,
    setPrefetchDataIsLoadedLoaded,
    upsertRecordsInCache,
  };
};
