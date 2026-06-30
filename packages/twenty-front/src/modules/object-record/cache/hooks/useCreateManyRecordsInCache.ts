import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { isDefined } from 'twenty-shared/utils';

export const useCreateManyRecordsInCache = <T extends ObjectRecord>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const createOneRecordInCache = useCreateOneRecordInCache({
    objectMetadataItem,
  });

  const createManyRecordsInCache = (recordsToCreate: Partial<T>[]) => {
    const recordsWithId = recordsToCreate
      .map((record) => {
        return prefillRecord<T>({
          input: record,
          objectMetadataItem,
        });
      })
      .filter(isDefined);

    const createdRecordsInCache = [] as T[];

    for (const record of recordsWithId) {
      if (isDefined(record)) {
        createOneRecordInCache(record);
        createdRecordsInCache.push(record);
      }
    }

    return createdRecordsInCache;
  };

  return { createManyRecordsInCache };
};
