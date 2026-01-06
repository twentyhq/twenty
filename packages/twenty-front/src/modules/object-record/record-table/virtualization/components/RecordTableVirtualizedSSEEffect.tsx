import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ON_SUBSCRIPTION_MATCH } from '@/subscription/graphql/subscriptions/onSubscriptionMatch';
import { useSseClient } from '@/subscription/hooks/useSseClient.util';
import { subscriptionBrowserTabIdState } from '@/subscription/states/subscriptionBrowserTabIdState';
import { isNonEmptyArray } from '@sniptt/guards';
import { type ExecutionResult, print } from 'graphql';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';
import {
  DatabaseEventAction,
  type OnSubscriptionMatchSubscription,
} from '~/generated/graphql';

export const RecordTableVirtualizedSSEEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { registerObjectOperation } = useRegisterObjectOperation();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });
  const apolloCoreClient = useApolloCoreClient();
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { objectMetadataItems } = useObjectMetadataItems();

  const { sseClient } = useSseClient();

  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
  });
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const debouncedRefetchAggregateQueries = useDebouncedCallback(
    refetchAggregateQueries,
    200,
  );

  const [subscriptionBrowserTabId, setSubscriptionBrowserTabId] =
    useRecoilState(subscriptionBrowserTabIdState);

  const subscriptionId = `${subscriptionBrowserTabId}-record-table-virtualized-data-changed`;

  useEffect(() => {
    if (!isDefined(subscriptionBrowserTabId)) {
      return;
    }

    const unsubscribe = sseClient.subscribe(
      {
        query: print(ON_SUBSCRIPTION_MATCH),
        variables: {
          subscriptions: [
            {
              id: subscriptionId,
              query: print(findManyRecordsQuery),
            },
          ],
        },
      },
      {
        next: (
          executionResult: ExecutionResult<OnSubscriptionMatchSubscription>,
        ) => {
          const matches =
            executionResult.data?.onSubscriptionMatch?.matches ?? [];

          const matchesForThisSubscription = matches.filter((match) => {
            return match.subscriptionIds.includes(subscriptionId);
          });

          const updateEvents = matchesForThisSubscription.filter((match) => {
            return match.event.action === DatabaseEventAction.UPDATED;
          });

          if (updateEvents.length !== 1) {
            return;
          }

          const cache = apolloCoreClient.cache;

          for (const updateEvent of updateEvents) {
            const updatedRecord = updateEvent.event.record;

            upsertRecordsInStore({ partialRecords: [updatedRecord] });

            const cachedRecord = getRecordFromCache<ObjectRecord>(
              updatedRecord.id,
            );

            const cachedRecordWithConnection =
              getRecordNodeFromRecord<ObjectRecord>({
                record: cachedRecord,
                objectMetadataItem,
                objectMetadataItems,
                recordGqlFields: recordGqlFields,
                computeReferences: false,
              });

            const computedOptimisticRecord = {
              ...updatedRecord,
              id: updatedRecord.id,
              __typename: getObjectTypename(objectMetadataItem.nameSingular),
            };

            const computedOptimisticRecordWithConnection =
              getRecordNodeFromRecord<ObjectRecord>({
                record: computedOptimisticRecord,
                objectMetadataItem,
                objectMetadataItems,
                recordGqlFields: recordGqlFields,
              });

            if (
              !isDefined(cachedRecordWithConnection) ||
              !isDefined(computedOptimisticRecordWithConnection)
            ) {
              continue;
            }

            triggerUpdateRecordOptimisticEffect({
              cache,
              objectMetadataItem,
              currentRecord: cachedRecordWithConnection,
              updatedRecord: computedOptimisticRecordWithConnection,
              objectMetadataItems,
              objectPermissionsByObjectMetadataId,
              upsertRecordsInStore,
            });

            const updatedFields = updateEvent.event.updatedFields ?? [];

            const updatedRecordWithUpdatedFieldsOnly = Object.fromEntries(
              updatedFields.map((fieldName) => {
                return [fieldName, updatedRecord[fieldName]];
              }),
            );

            registerObjectOperation(objectMetadataItem, {
              type: 'update-one',
              result: { updateInput: updatedRecordWithUpdatedFieldsOnly },
            });
          }

          if (isNonEmptyArray(updateEvents)) {
            debouncedRefetchAggregateQueries();
          }
        },
        error: () => {},
        complete: () => {},
      },
    );

    return () => {
      unsubscribe();
    };
  }, [
    sseClient,
    findManyRecordsQuery,
    apolloCoreClient.cache,
    upsertRecordsInStore,
    getRecordFromCache,
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    objectPermissionsByObjectMetadataId,
    registerObjectOperation,
    debouncedRefetchAggregateQueries,
    subscriptionBrowserTabId,
    subscriptionId,
  ]);

  useEffect(() => {
    if (!isDefined(subscriptionBrowserTabId)) {
      setSubscriptionBrowserTabId(v4());
    }
  }, [subscriptionBrowserTabId, setSubscriptionBrowserTabId]);

  return <></>;
};
