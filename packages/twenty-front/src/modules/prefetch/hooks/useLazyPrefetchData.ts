import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const useLazyPrefetchedData = <T extends ObjectRecord>(
  prefetchKey: PrefetchKey,
  filter?: RecordGqlOperationFilter,
) => {
  const { operationSignatureFactory, objectNameSingular } =
    PREFETCH_CONFIG[prefetchKey];

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordGqlFields =
    operationSignatureFactory({ objectMetadataItem }).fields ?? filter;
  const { records, findManyRecords } = useLazyFindManyRecords<T>({
    objectNameSingular: objectNameSingular,
    recordGqlFields,
  });

  return {
    findManyRecords,
    records,
  };
};
