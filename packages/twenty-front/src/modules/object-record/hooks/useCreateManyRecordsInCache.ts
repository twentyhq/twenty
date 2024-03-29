import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

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

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const createManyRecordsInCache = (
    recordsToCreate: Partial<T>[],
    queryFields?: Record<string, any>,
  ) => {
    const recordsWithId = recordsToCreate
      .map((record) => {
        return getRecordNodeFromRecord({
          record: { ...record, id: record.id ?? v4() },
          objectMetadataItem,
          objectMetadataItems,
        });
      })
      .filter(isDefined);

    const createdRecordsInCache = [] as T[];

    for (const record of recordsWithId) {
      const generatedCachedObjectRecord =
        generateObjectRecordOptimisticResponse<T>(record);

      if (isDefined(generatedCachedObjectRecord)) {
        addRecordInCache(generatedCachedObjectRecord, queryFields);

        createdRecordsInCache.push(generatedCachedObjectRecord);
      }
    }

    return createdRecordsInCache;
  };

  return { createManyRecordsInCache };
};
