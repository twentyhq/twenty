import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type useCreateOneRecordInCacheProps = {
  objectNameSingular: string;
};

export const useCreateOneRecordInCache = <T>({
  objectNameSingular,
}: useCreateOneRecordInCacheProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectMetadataItem,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem,
    });

  const addRecordInCache = useAddRecordInCache({
    objectMetadataItem,
  });

  const createOneRecordInCache = (
    recordToCreate: ObjectRecord,
    queryFields?: Record<string, any>,
  ) => {
    const recordToCreateWithNestedConnections = getRecordNodeFromRecord({
      record: recordToCreate,
      objectMetadataItem,
      objectMetadataItems,
      depth: 1,
    });

    if (!recordToCreateWithNestedConnections) {
      return null;
    }

    const generatedCachedObjectRecord = generateObjectRecordOptimisticResponse(
      recordToCreateWithNestedConnections,
    );

    addRecordInCache(generatedCachedObjectRecord, queryFields);
    const record = getRecordFromCache(generatedCachedObjectRecord.id);

    return record as T;
  };

  return {
    createOneRecordInCache,
  };
};
