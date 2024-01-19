import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAddRecordInCache } from '@/object-record/hooks/useAddRecordInCache';
import { useGenerateEmptyRecord } from '@/object-record/hooks/useGenerateEmptyRecord';
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

  const { generateEmptyRecord } = useGenerateEmptyRecord({
    objectMetadataItem,
  });

  const addRecordInCache = useAddRecordInCache({
    objectMetadataItem,
  });

  const createOneRecordInCache = async (input: ObjectRecord) => {
    const generatedEmptyRecord = generateEmptyRecord({
      createdAt: new Date().toISOString(),
      ...input,
    });

    addRecordInCache(generatedEmptyRecord);

    return generatedEmptyRecord as T;
  };

  return {
    createOneRecordInCache,
  };
};
