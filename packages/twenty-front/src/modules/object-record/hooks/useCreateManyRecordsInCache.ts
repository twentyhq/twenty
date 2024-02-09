import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useCreateManyRecordsInCache = <T extends ObjectRecord>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
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

  const createManyRecordsInCache = (data: Partial<T>[]) => {
    const recordsWithId = data.map((record) => ({
      ...record,
      id: (record.id as string) ?? v4(),
    }));

    const createdRecordsInCache = [] as T[];

    for (const record of recordsWithId) {
      const generatedCachedObjectRecord =
        generateObjectRecordOptimisticResponse<T>(record);

      if (generatedCachedObjectRecord) {
        addRecordInCache(generatedCachedObjectRecord);

        createdRecordsInCache.push(generatedCachedObjectRecord);
      }
    }

    return createdRecordsInCache;
  };

  return { createManyRecordsInCache };
};
