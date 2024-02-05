import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
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

  const createOneRecordInCache = (input: ObjectRecord) => {
    const generatedCachedObjectRecord =
      generateObjectRecordOptimisticResponse(input);

    addRecordInCache(generatedCachedObjectRecord);

    return generatedCachedObjectRecord as T;
  };

  return {
    createOneRecordInCache,
  };
};
