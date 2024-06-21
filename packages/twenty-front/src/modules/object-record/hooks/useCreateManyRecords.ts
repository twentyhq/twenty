import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/utils/getCreateManyRecordsMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isDefined } from '~/utils/isDefined';

type useCreateManyRecordsProps = {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  skipPostOptmisticEffect?: boolean;
};

export const useCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptmisticEffect = false,
}: useCreateManyRecordsProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const computedRecordGqlFields =
    recordGqlFields ?? generateDepthOneRecordGqlFields({ objectMetadataItem });

  const { createManyRecordsMutation } = useCreateManyRecordsMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const createOneRecordInCache = useCreateOneRecordInCache<ObjectRecord>({
    objectMetadataItem,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const createManyRecords = async (
    recordsToCreate: Partial<CreatedObjectRecord>[],
    upsert?: boolean,
  ) => {
    const sanitizedCreateManyRecordsInput = recordsToCreate.map(
      (recordToCreate) => {
        const idForCreation = recordToCreate?.id ?? (upsert ? undefined : v4());

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
      if (recordToCreate.id === null) {
        continue;
      }

      const recordCreatedInCache = createOneRecordInCache({
        ...(recordToCreate as { id: string }),
        __typename: getObjectTypename(objectMetadataItem.nameSingular),
      });

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
        upsert: upsert,
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
