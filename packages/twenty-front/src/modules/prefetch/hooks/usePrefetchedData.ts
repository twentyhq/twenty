import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const usePrefetchedData = <T extends ObjectRecord>(
  prefetchKey: PrefetchKey,
  filter?: RecordGqlOperationFilter,
) => {
  const isDataPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(prefetchKey),
  );

  const prefetchQueryKey = PREFETCH_CONFIG[prefetchKey];

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: prefetchQueryKey.objectNameSingular,
  });

  const { records } = useFindManyRecords<T>({
    skip: !isDataPrefetched,
    objectNameSingular: prefetchQueryKey.objectNameSingular,
    recordGqlFields:
      prefetchQueryKey.fields ??
      generateDepthOneRecordGqlFields({
        objectMetadataItem,
      }),
    filter,
  });

  return {
    isDataPrefetched,
    records,
  };
};
