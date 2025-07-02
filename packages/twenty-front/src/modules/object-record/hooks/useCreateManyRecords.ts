import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { hasObjectMetadataItemFieldCreatedBy } from '@/object-metadata/utils/hasObjectMetadataItemFieldCreatedBy';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { FieldActorForInputValue } from '@/object-record/record-field/types/FieldMetadata';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/utils/getCreateManyRecordsMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type PartialObjectRecordWithId = Partial<ObjectRecord> & {
  id: string;
};

type PartialObjectRecordWithOptionalId = Partial<ObjectRecord> & {
  id?: string;
};

export type useCreateManyRecordsProps = {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  skipPostOptimisticEffect?: boolean;
  shouldMatchRootQueryFilter?: boolean;
  shouldRefetchAggregateQueries?: boolean;
};

export const useCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptimisticEffect = false,
  shouldMatchRootQueryFilter,
  shouldRefetchAggregateQueries = true,
}: useCreateManyRecordsProps) => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataHasCreatedByField =
    hasObjectMetadataItemFieldCreatedBy(objectMetadataItem);

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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  type createManyRecordsProps = {
    recordsToCreate: Partial<CreatedObjectRecord>[];
    upsert?: boolean;
    abortController?: AbortController;
  };

  const createManyRecords = async ({
    recordsToCreate,
    upsert,
    abortController,
  }: createManyRecordsProps) => {
    const sanitizedCreateManyRecordsInput: PartialObjectRecordWithOptionalId[] =
      [];
    const recordOptimisticRecordsInput: PartialObjectRecordWithId[] = [];
    recordsToCreate.forEach((recordToCreate) => {
      const shouldDoOptimisticEffect = upsert !== true;
      const idForCreation = shouldDoOptimisticEffect
        ? (recordToCreate?.id ?? v4())
        : undefined;
      const sanitizedRecord = {
        ...sanitizeRecordInput({
          objectMetadataItem,
          recordInput: recordToCreate,
        }),
        ...(isDefined(idForCreation) ? { id: idForCreation } : {}),
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

      sanitizedCreateManyRecordsInput.push(sanitizedRecord);

      if (shouldDoOptimisticEffect) {
        const optimisticRecordInput = {
          ...computeOptimisticRecordFromInput({
            cache: apolloCoreClient.cache,
            objectMetadataItem,
            objectMetadataItems,
            currentWorkspaceMember: currentWorkspaceMember,
            recordInput: {
              ...baseOptimisticRecordInputCreatedBy,
              ...recordToCreate,
            },
            objectPermissionsByObjectMetadataId,
          }),
          id: idForCreation as string,
        };
        recordOptimisticRecordsInput.push(optimisticRecordInput);
      }
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
        cache: apolloCoreClient.cache,
        objectMetadataItem,
        recordsToCreate: recordNodeCreatedInCache,
        objectMetadataItems,
        shouldMatchRootQueryFilter,
        objectPermissionsByObjectMetadataId,
      });
    }

    const mutationResponseField = getCreateManyRecordsMutationResponseField(
      objectMetadataItem.namePlural,
    );

    const createdObjects = await apolloCoreClient
      .mutate({
        mutation: createManyRecordsMutation,
        variables: {
          data: sanitizedCreateManyRecordsInput,
          upsert: upsert,
        },
        context: {
          fetchOptions: {
            signal: abortController?.signal,
          },
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
            objectPermissionsByObjectMetadataId,
          });
        },
      })
      .catch((error: Error) => {
        recordsCreatedInCache.forEach((recordToDestroy) => {
          deleteRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloCoreClient.cache,
            recordToDestroy,
          });
        });

        triggerDestroyRecordsOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          recordsToDestroy: recordsCreatedInCache,
          objectMetadataItems,
        });

        throw error;
      });

    if (shouldRefetchAggregateQueries) await refetchAggregateQueries();

    return createdObjects.data?.[mutationResponseField] ?? [];
  };

  return { createManyRecords };
};
