import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { useMapRelationRecordsToRelationConnection } from '@/object-record/hooks/useMapRelationRecordsToRelationConnection';
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

  const { generateObjectRecordOptimisticResponse } =
    useGenerateObjectRecordOptimisticResponse({
      objectMetadataItem,
    });

  const addRecordInCache = useAddRecordInCache({
    objectMetadataItem,
  });

  const { mapRecordRelationRecordsToRelationConnection } =
    useMapRelationRecordsToRelationConnection();

  const createOneRecordInCache = (recordToCreate: ObjectRecord) => {
    const recordToCreateWithNestedConnections =
      mapRecordRelationRecordsToRelationConnection({
        objectRecord: recordToCreate,
        objectNameSingular,
      });

    if (!recordToCreateWithNestedConnections) {
      throw new Error('Record to create with nested connections is undefined');
    }

    const generatedCachedObjectRecord = generateObjectRecordOptimisticResponse(
      recordToCreateWithNestedConnections,
    );

    addRecordInCache(generatedCachedObjectRecord);

    return generatedCachedObjectRecord as T;
  };

  return {
    createOneRecordInCache,
  };
};
