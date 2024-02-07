import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateCachedObjectRecord } from '@/object-record/cache/hooks/useGenerateCachedObjectRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useCreateManyRecordsInCache = <T extends ObjectRecord>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { generateCachedObjectRecord } = useGenerateCachedObjectRecord({
    objectMetadataItem,
  });

  const addRecordInCache = useAddRecordInCache({
    objectMetadataItem,
  });

  const createManyRecordsInCache = async (data: Partial<T>[]) => {
    const recordsWithId = data.map((record) => ({
      ...record,
      id: (record.id as string) ?? v4(),
    }));

    const createdRecordsInCache = [] as T[];

    for (const record of recordsWithId) {
      const generatedCachedObjectRecord = generateCachedObjectRecord<T>({
        ...record,
      });

      if (generatedCachedObjectRecord) {
        addRecordInCache(generatedCachedObjectRecord);

        createdRecordsInCache.push(generatedCachedObjectRecord);
      }
    }

    return createdRecordsInCache;
  };

  return { createManyRecordsInCache };
};
