import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { useMapRelationRecordsToRelationConnection } from '@/object-record/hooks/useMapRelationRecordsToRelationConnection';
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

  const { mapRecordRelationRecordsToRelationConnection } =
    useMapRelationRecordsToRelationConnection();

  const createManyRecordsInCache = (recordsToCreate: Partial<T>[]) => {
    const recordsWithId = recordsToCreate
      .map((record) => {
        return mapRecordRelationRecordsToRelationConnection({
          objectRecord: {
            ...record,
            id: (record.id as string) ?? v4(),
          },
          objectNameSingular,
        });
      })
      .filter(isDefined);

    const createdRecordsInCache = [] as T[];

    for (const record of recordsWithId) {
      const generatedCachedObjectRecord =
        generateObjectRecordOptimisticResponse<T>(record);

      if (isDefined(generatedCachedObjectRecord)) {
        addRecordInCache(generatedCachedObjectRecord);

        createdRecordsInCache.push(generatedCachedObjectRecord);
      }
    }

    return createdRecordsInCache;
  };

  return { createManyRecordsInCache };
};
