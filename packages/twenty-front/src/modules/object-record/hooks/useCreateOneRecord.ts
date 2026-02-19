import { useState } from 'react';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type ObjectRecord as ObjectRecordShared,
  type RecordGqlOperationGqlRecordFields,
} from 'twenty-shared/types';

import { type BaseObjectRecord } from '@/object-record/types/BaseObjectRecord';
import { computeOptimisticCreateRecordBaseRecordInput } from '@/object-record/utils/computeOptimisticCreateRecordBaseRecordInput';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { getCreateOneRecordMutationResponseField } from '@/object-record/utils/getCreateOneRecordMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useRecoilValue } from 'recoil';
import { CustomError, isDefined } from 'twenty-shared/utils';

type useCreateOneRecordProps = {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  skipPostOptimisticEffect?: boolean;
  shouldMatchRootQueryFilter?: boolean;
};

export const useCreateOneRecord = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptimisticEffect = false,
  shouldMatchRootQueryFilter,
}: useCreateOneRecordProps) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const apolloCoreClient = useApolloCoreClient();
  const [loading, setLoading] = useState(false);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular,
      depth: 1,
    });

  const computedRecordGqlFields = recordGqlFields ?? depthOneRecordGqlFields;

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const createOneRecordInCache = useCreateOneRecordInCache<CreatedObjectRecord>(
    {
      objectMetadataItem,
    },
  );

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { refetchAggregateQueries } = useRefetchAggregateQueries();

  const createOneRecord = async (recordInput: Partial<CreatedObjectRecord>) => {
    setLoading(true);

    const idForCreation = recordInput.id ?? v4();

    const sanitizedInput = {
      ...sanitizeRecordInput({
        objectMetadataItem,
        recordInput,
      }),
      id: idForCreation,
    };

    const optimisticRecordInput = computeOptimisticRecordFromInput({
      cache: apolloCoreClient.cache,
      currentWorkspaceMember: currentWorkspaceMember,
      objectMetadataItem,
      objectMetadataItems,
      recordInput: {
        ...computeOptimisticCreateRecordBaseRecordInput(objectMetadataItem),
        ...recordInput,
        id: idForCreation,
      },
      objectPermissionsByObjectMetadataId,
    });
    const recordCreatedInCache = createOneRecordInCache({
      ...optimisticRecordInput,
      id: idForCreation,
      __typename: getObjectTypename(objectMetadataItem.nameSingular),
    });

    if (isDefined(recordCreatedInCache)) {
      const optimisticRecordNode = getRecordNodeFromRecord({
        objectMetadataItem,
        objectMetadataItems,
        record: recordCreatedInCache,
        recordGqlFields: computedRecordGqlFields,
        computeReferences: false,
      });

      if (skipPostOptimisticEffect === false && optimisticRecordNode !== null) {
        triggerCreateRecordsOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          recordsToCreate: [optimisticRecordNode],
          objectMetadataItems,
          shouldMatchRootQueryFilter,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });
      }
    }

    const mutationResponseField =
      getCreateOneRecordMutationResponseField(objectNameSingular);

    const createdObject = await apolloCoreClient
      .mutate<ObjectRecord>({
        mutation: createOneRecordMutation,
        variables: {
          input: sanitizedInput,
        },
        update: (cache, { data }) => {
          const record = data?.[mutationResponseField];
          if (skipPostOptimisticEffect === false && isDefined(record)) {
            triggerCreateRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToCreate: [record],
              objectMetadataItems,
              shouldMatchRootQueryFilter,
              checkForRecordInCache: true,
              objectPermissionsByObjectMetadataId,
              upsertRecordsInStore,
            });
          }

          setLoading(false);
        },
      })
      .catch((error: Error) => {
        if (!recordCreatedInCache) {
          throw error;
        }

        deleteRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          recordToDestroy: recordCreatedInCache,
          upsertRecordsInStore,
          objectPermissionsByObjectMetadataId,
        });

        triggerDestroyRecordsOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          recordsToDestroy: [recordCreatedInCache],
          objectMetadataItems,
          upsertRecordsInStore,
          objectPermissionsByObjectMetadataId,
        });

        throw error;
      });

    await refetchAggregateQueries({
      objectMetadataNamePlural: objectMetadataItem.namePlural,
    });

    const positionToUse =
      recordInput.position === 'first'
        ? 'first'
        : recordInput.position === 'last'
          ? 'last'
          : null;

    const createdRecord = createdObject.data?.[
      mutationResponseField
    ] as ObjectRecordShared & BaseObjectRecord;

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem,
      operation: {
        type: 'create-one',
        createdRecord: { ...createdRecord, position: positionToUse },
      },
    });

    if (!isDefined(createdRecord)) {
      throw new CustomError('Failed to create record');
    }

    return getRecordFromRecordNode({
      recordNode: createdRecord,
    });
  };

  return {
    createOneRecord,
    loading,
  };
};
