import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateCachedObjectRecord } from '@/object-record/cache/hooks/useGenerateCachedObjectRecord';
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

  const { generateCachedObjectRecord } = useGenerateCachedObjectRecord({
    objectMetadataItem,
  });

  const addRecordInCache = useAddRecordInCache({
    objectMetadataItem,
  });

  const createOneRecordInCache = async (input: ObjectRecord) => {
    const generatedCachedObjectRecord = generateCachedObjectRecord({
      createdAt: new Date().toISOString(),
      ...input,
    });

    addRecordInCache(generatedCachedObjectRecord);

    return generatedCachedObjectRecord as T;
  };

  return {
    createOneRecordInCache,
  };
};
