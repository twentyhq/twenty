import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useAddRecordInCache } from '@/object-record/hooks/useAddRecordInCache';
import { useGenerateEmptyRecord } from '@/object-record/hooks/useGenerateEmptyRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useCreateManyRecordsInCache = <T extends ObjectRecord>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { generateEmptyRecord } = useGenerateEmptyRecord({
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

    const createdRecordsInCache = [] as Partial<T>[];

    for (const record of recordsWithId) {
      const generatedEmptyRecord = generateEmptyRecord({
        createdAt: new Date().toISOString(),
        ...record,
      });

      if (generatedEmptyRecord) {
        addRecordInCache(generatedEmptyRecord);

        createdRecordsInCache.push(generatedEmptyRecord);
      }
    }

    return createdRecordsInCache;
  };

  return { createManyRecordsInCache };
};
