import { useApolloClient } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { capitalize, isDefined } from 'twenty-shared';
import { recordFromArrayWithValue } from '~/utils/array/recordFromArrayWithValue';

type useUpdateOneRecordProps = {
  objectNameSingular: string;
  recordGqlFields?: Record<string, any>;
};

export const useUpdateOneRecord = <
  UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
}: useUpdateOneRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const computedRecordGqlFields =
    recordGqlFields ?? generateDepthOneRecordGqlFields({ objectMetadataItem });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const updateOneRecord = async ({
    idToUpdate,
    updateOneRecordInput,
    optimisticRecord,
  }: {
    idToUpdate: string;
    updateOneRecordInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
    optimisticRecord?: Partial<ObjectRecord>;
  }) => {
    const minimalRecord: ObjectRecord = {
      __typename: capitalize(objectMetadataItem.nameSingular),
      id: idToUpdate,
    };
    const optimisticRecordInput =
      optimisticRecord ??
      computeOptimisticRecordFromInput({
        objectMetadataItem,
        recordInput: updateOneRecordInput,
        cache: apolloClient.cache,
        objectMetadataItems,
      });

    const cachedRecord =
      getRecordFromCache<ObjectRecord>(idToUpdate) ?? minimalRecord;

    const cachedRecordWithConnection = getRecordNodeFromRecord<ObjectRecord>({
      record: cachedRecord,
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields: computedRecordGqlFields,
      computeReferences: false,
    });

    const computedOptimisticRecord = {
      ...cachedRecord,
      ...optimisticRecordInput,
    };

    const optimisticRecordWithConnection =
      getRecordNodeFromRecord<ObjectRecord>({
        record: computedOptimisticRecord,
        objectMetadataItem,
        objectMetadataItems,
        recordGqlFields: computedRecordGqlFields,
        computeReferences: false,
      });

    if (!optimisticRecordWithConnection || !cachedRecordWithConnection) {
      throw new Error(
        'Should never occurs, encountered empty cache should fallbacked',
      );
    }

    const recordGqlFields = generateDepthOneRecordGqlFields({
      objectMetadataItem,
      record: optimisticRecordInput,
    });
    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloClient.cache,
      record: computedOptimisticRecord,
      recordGqlFields,
    });

    triggerUpdateRecordOptimisticEffect({
      cache: apolloClient.cache,
      objectMetadataItem,
      currentRecord: cachedRecordWithConnection,
      updatedRecord: optimisticRecordWithConnection,
      objectMetadataItems,
    });

    const mutationResponseField =
      getUpdateOneRecordMutationResponseField(objectNameSingular);

    const sanitizedInput = {
      ...sanitizeRecordInput({
        objectMetadataItem,
        recordInput: updateOneRecordInput,
      }),
    };
    const updatedRecord = await apolloClient
      .mutate({
        mutation: updateOneRecordMutation,
        variables: {
          idToUpdate,
          input: sanitizedInput,
        },
        update: (cache, { data }) => {
          const record = data?.[mutationResponseField];

          if (!isDefined(record) || !isDefined(computedOptimisticRecord))
            return;

          triggerUpdateRecordOptimisticEffect({
            cache,
            objectMetadataItem,
            currentRecord: computedOptimisticRecord,
            updatedRecord: record,
            objectMetadataItems,
          });
        },
      })
      .catch((error: Error) => {
        const cachedRecordKeys = new Set(Object.keys(cachedRecord));
        const diffKeys = Object.keys(optimisticRecordInput).filter(
          (diffKey) => !cachedRecordKeys.has(diffKey),
        );

        const recordGqlFields = {
          ...generateDepthOneRecordGqlFields({
            objectMetadataItem,
            record: cachedRecord,
          }),
          ...recordFromArrayWithValue(diffKeys, true),
        };

        updateRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloClient.cache,
          record: {
            ...cachedRecord,
            ...recordFromArrayWithValue(diffKeys, null),
          },
          recordGqlFields,
        });

        triggerUpdateRecordOptimisticEffect({
          cache: apolloClient.cache,
          objectMetadataItem,
          currentRecord: optimisticRecordWithConnection,
          updatedRecord: cachedRecordWithConnection,
          objectMetadataItems,
        });

        throw error;
      });

    await refetchAggregateQueries();
    return updatedRecord?.data?.[mutationResponseField] ?? null;
  };

  return {
    updateOneRecord,
  };
};
