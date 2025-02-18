import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { checkObjectMetadataItemHasFieldCreatedBy } from '@/object-metadata/utils/checkObjectMetadataItemHasFieldCreatedBy';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { FieldActorForInputValue } from '@/object-record/record-field/types/FieldMetadata';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/utils/getCreateManyRecordsMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

type PartialObjectRecordWithId = Partial<ObjectRecord> & {
  id: string;
};

type useCreateManyRecordsProps = {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  skipPostOptimisticEffect?: boolean;
  shouldMatchRootQueryFilter?: boolean;
};

export const useCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptimisticEffect = false,
  shouldMatchRootQueryFilter,
}: useCreateManyRecordsProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataHasCreatedByField =
    checkObjectMetadataItemHasFieldCreatedBy(objectMetadataItem);

  const computedRecordGqlFields =
    recordGqlFields ?? generateDepthOneRecordGqlFields({ objectMetadataItem });

  const { createManyRecordsMutation } = useCreateManyRecordsMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const createOneRecordInCache = useCreateOneRecordInCache<ObjectRecord>({
    objectMetadataItem,
  });

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItems } = useObjectMetadataItems();

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const createManyRecords = async (
    recordsToCreate: Partial<CreatedObjectRecord>[],
    upsert?: boolean,
  ) => {
    const sanitizedCreateManyRecordsInput: PartialObjectRecordWithId[] = [];
    const recordOptimisticRecordsInput: PartialObjectRecordWithId[] = [];
    recordsToCreate.forEach((recordToCreate) => {
      const idForCreation = recordToCreate?.id ?? v4();
      const sanitizedRecord = {
        ...sanitizeRecordInput({
          objectMetadataItem,
          recordInput: recordToCreate,
        }),
        id: idForCreation,
      };
      const baseOptimisticRecordInputCreatedBy:
        | { createdBy: FieldActorForInputValue }
        | undefined = objectMetadataHasCreatedByField
        ? {
            createdBy: {
              source: 'MANUAL',
              context: {},
            },
          }
        : undefined;
      const optimisticRecordInput = {
        ...computeOptimisticRecordFromInput({
          cache: apolloClient.cache,
          objectMetadataItem,
          objectMetadataItems,
          currentWorkspaceMember: currentWorkspaceMember,
          recordInput: {
            ...baseOptimisticRecordInputCreatedBy,
            ...recordToCreate,
          },
        }),
        id: idForCreation,
      };

      sanitizedCreateManyRecordsInput.push(sanitizedRecord);
      recordOptimisticRecordsInput.push(optimisticRecordInput);
    });

    const recordsCreatedInCache = recordOptimisticRecordsInput
      .map((recordToCreate) =>
        createOneRecordInCache({
          ...recordToCreate,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        }),
      )
      .filter(isDefined);

    if (recordsCreatedInCache.length > 0) {
      const recordNodeCreatedInCache = recordsCreatedInCache
        .map((record) =>
          getRecordNodeFromRecord({
            objectMetadataItem,
            objectMetadataItems,
            record: record,
            computeReferences: false,
          }),
        )
        .filter(isDefined);

      triggerCreateRecordsOptimisticEffect({
        cache: apolloClient.cache,
        objectMetadataItem,
        recordsToCreate: recordNodeCreatedInCache,
        objectMetadataItems,
        shouldMatchRootQueryFilter,
      });
    }

    const mutationResponseField = getCreateManyRecordsMutationResponseField(
      objectMetadataItem.namePlural,
    );

    const createdObjects = await apolloClient
      .mutate({
        mutation: createManyRecordsMutation,
        variables: {
          data: sanitizedCreateManyRecordsInput,
          upsert: upsert,
        },
        update: (cache, { data }) => {
          const records = data?.[mutationResponseField];

          if (!isDefined(records?.length) || skipPostOptimisticEffect) return;

          triggerCreateRecordsOptimisticEffect({
            cache,
            objectMetadataItem,
            recordsToCreate: records,
            objectMetadataItems,
            shouldMatchRootQueryFilter,
            checkForRecordInCache: true,
          });
        },
      })
      .catch((error: Error) => {
        recordsCreatedInCache.forEach((recordToDestroy) => {
          deleteRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            recordToDestroy,
          });
        });

        triggerDestroyRecordsOptimisticEffect({
          cache: apolloClient.cache,
          objectMetadataItem,
          recordsToDestroy: recordsCreatedInCache,
          objectMetadataItems,
        });

        throw error;
      });

    await refetchAggregateQueries();
    return createdObjects.data?.[mutationResponseField] ?? [];
  };

  return { createManyRecords };
};
