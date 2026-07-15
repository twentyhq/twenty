import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getUnknownRecordInputFields } from '@/object-record/utils/getUnknownRecordInputFields';
import { captureMessage } from '@sentry/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

export const useTriggerOptimisticEffectFromSseUpdateEvents = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const triggerOptimisticEffectFromSseUpdateEvents = useCallback(
    ({
      objectRecordEvents,
      objectMetadataItem: objectMetadataItemFromCaller,
    }: {
      objectRecordEvents: ObjectRecordEvent[];
      objectMetadataItem: EnrichedObjectMetadataItem;
    }) => {
      const objectMetadataItems = store.get(
        objectMetadataItemsWithFieldsSelector.atom,
      );

      const objectMetadataItem =
        objectMetadataItems.find(
          (item) => item.id === objectMetadataItemFromCaller.id,
        ) ?? objectMetadataItemFromCaller;

      const updateEvents = objectRecordEvents.filter((objectRecordEvent) => {
        return objectRecordEvent.action === DatabaseEventAction.UPDATED;
      });

      for (const updateEvent of updateEvents) {
        const recordFromEvent = updateEvent.properties.after;

        if (!isDefined(recordFromEvent)) {
          continue;
        }

        const unknownRecordInputFields = getUnknownRecordInputFields({
          objectMetadataItem,
          recordInput: recordFromEvent,
        });

        if (unknownRecordInputFields.length > 0) {
          captureMessage(
            `SSE update event for ${objectMetadataItem.nameSingular} carried fields unknown to this tab's metadata: ${unknownRecordInputFields.join(', ')}`,
            'warning',
          );
        }

        const updatedRecord =
          unknownRecordInputFields.length > 0
            ? Object.fromEntries(
                Object.entries(recordFromEvent).filter(
                  ([recordKey]) =>
                    !unknownRecordInputFields.includes(recordKey),
                ),
              )
            : recordFromEvent;

        const computedOptimisticRecord = {
          ...computeOptimisticRecordFromInput({
            cache: apolloCoreClient.cache,
            objectMetadataItem,
            objectMetadataItems,
            recordInput: updatedRecord,
            objectPermissionsByObjectMetadataId,
            currentWorkspaceMember: null,
          }),
          id: updatedRecord.id,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        };

        const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
          objectMetadataItem,
          objectMetadataItems,
          record: computedOptimisticRecord,
          depth: 0,
        });

        const cachedRecord = getRecordFromCache({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          objectMetadataItems,
          recordId: updatedRecord.id,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });

        if (
          isDefined(cachedRecord?.updatedAt) &&
          isDefined(updatedRecord.updatedAt) &&
          new Date(updatedRecord.updatedAt as string).getTime() <
            new Date(cachedRecord!.updatedAt as string).getTime()
        ) {
          continue;
        }

        const cachedRecordWithConnection = getRecordNodeFromRecord({
          record: cachedRecord,
          objectMetadataItem,
          objectMetadataItems,
          recordGqlFields,
          computeReferences: false,
        });

        if (
          !isDefined(cachedRecord) ||
          !isDefined(cachedRecordWithConnection)
        ) {
          continue;
        }

        upsertRecordsInStore({ partialRecords: [updatedRecord] });

        updateRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          record: computedOptimisticRecord,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });

        const computedOptimisticRecordWithConnection = getRecordNodeFromRecord({
          record: computedOptimisticRecord,
          objectMetadataItem,
          objectMetadataItems,
          recordGqlFields,
        });

        if (!isDefined(computedOptimisticRecordWithConnection)) {
          continue;
        }

        triggerUpdateRecordOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          currentRecord: cachedRecordWithConnection,
          updatedRecord: computedOptimisticRecordWithConnection,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });
      }

      if (isNonEmptyArray(updateEvents)) {
        refetchAggregateQueriesForObjectMetadataItem({
          objectMetadataItem,
        });
      }

      return isNonEmptyArray(updateEvents);
    },
    [
      store,
      apolloCoreClient.cache,
      objectPermissionsByObjectMetadataId,
      refetchAggregateQueriesForObjectMetadataItem,
      upsertRecordsInStore,
    ],
  );

  return {
    triggerOptimisticEffectFromSseUpdateEvents,
  };
};
