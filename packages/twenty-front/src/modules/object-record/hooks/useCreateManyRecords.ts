import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import {
  getCreateManyRecordsMutationResponseField,
  useGenerateCreateManyRecordMutation,
} from '@/object-record/hooks/useGenerateCreateManyRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isDefined } from '~/utils/isDefined';

type useCreateManyRecordsProps = {
  objectNameSingular: string;
  queryFields?: Record<string, any>;
  depth?: number;
  skipPostOptmisticEffect?: boolean;
};

export const useCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  queryFields,
  depth = 1,
  skipPostOptmisticEffect = false,
}: useCreateManyRecordsProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const createManyRecordsMutation = useGenerateCreateManyRecordMutation({
    objectMetadataItem,
    queryFields,
    depth,
  });

  const createOneRecordInCache = useCreateOneRecordInCache<CachedObjectRecord>({
    objectMetadataItem,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const createManyRecords = async (
    recordsToCreate: Partial<CreatedObjectRecord>[],
  ) => {
    const sanitizedCreateManyRecordsInput = recordsToCreate.map(
      (recordToCreate) => {
        const idForCreation = recordToCreate?.id ?? v4();

        return {
          ...sanitizeRecordInput({
            objectMetadataItem,
            recordInput: recordToCreate,
          }),
          id: idForCreation,
        };
      },
    );

    const recordsCreatedInCache = [];

    for (const recordToCreate of sanitizedCreateManyRecordsInput) {
      const recordCreatedInCache = createOneRecordInCache(recordToCreate);

      if (isDefined(recordCreatedInCache)) {
        recordsCreatedInCache.push(recordCreatedInCache);
      }
    }

    if (recordsCreatedInCache.length > 0) {
      triggerCreateRecordsOptimisticEffect({
        cache: apolloClient.cache,
        objectMetadataItem,
        recordsToCreate: recordsCreatedInCache,
        objectMetadataItems,
      });
    }

    const mutationResponseField = getCreateManyRecordsMutationResponseField(
      objectMetadataItem.namePlural,
    );

    const createdObjects = await apolloClient.mutate({
      mutation: createManyRecordsMutation,
      variables: {
        data: sanitizedCreateManyRecordsInput,
      },
      update: (cache, { data }) => {
        const records = data?.[mutationResponseField];

        if (!records?.length || skipPostOptmisticEffect) return;

        triggerCreateRecordsOptimisticEffect({
          cache,
          objectMetadataItem,
          recordsToCreate: records,
          objectMetadataItems,
        });
      },
    });

    return createdObjects.data?.[mutationResponseField] ?? [];
  };

  return { createManyRecords };
};
