import { captureException } from '@sentry/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupFromGroupValueComponentFamilySelector } from '@/object-record/record-group/states/selectors/recordGroupFromGroupValueComponentFamilySelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION } from '@/object-record/record-table/virtualization/constants/SseTableDebounceTimeInMsToAvoidSseOwnEventsRaceCondition';
import { useGetShouldResetTableVirtualizationForUpdateInputs } from '@/object-record/record-table/virtualization/hooks/useGetShouldResetTableVirtualizationForUpdateInputs';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useRefetchRecordGroupOnObjectRecordOperation = ({
  refetchRecordGroup,
}: {
  refetchRecordGroup: () => Promise<unknown>;
}) => {
  const store = useStore();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGroupFromGroupValueCallbackState =
    useAtomComponentFamilySelectorCallbackState(
      recordGroupFromGroupValueComponentFamilySelector,
    );

  const { getShouldResetTableVirtualizationForUpdateInputs } =
    useGetShouldResetTableVirtualizationForUpdateInputs();

  const debouncedRefetchRecordGroup = useDebouncedCallback(
    () => {
      refetchRecordGroup().catch(captureException);
    },
    SSE_TABLE_DEBOUNCE_TIME_IN_MS_TO_AVOID_SSE_OWN_EVENTS_RACE_CONDITION,
    { leading: false },
  );

  const handleObjectRecordOperation = useCallback(
    (
      objectRecordOperationEventDetail: ObjectRecordOperationBrowserEventDetail,
    ) => {
      const objectRecordOperation = objectRecordOperationEventDetail.operation;

      switch (objectRecordOperation.type) {
        case 'create-one': {
          if (!isDefined(recordIndexGroupFieldMetadataItem)) {
            debouncedRefetchRecordGroup();

            return;
          }

          const recordGroupValue =
            objectRecordOperation.createdRecord[
              getFieldMetadataItemGqlFieldName(
                recordIndexGroupFieldMetadataItem,
              )
            ];

          const createdRecordGroup = store.get(
            recordGroupFromGroupValueCallbackState({ recordGroupValue }),
          );

          if (createdRecordGroup?.id === currentRecordGroupId) {
            debouncedRefetchRecordGroup();
          }

          return;
        }
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            objectRecordOperation.type === 'update-one'
              ? [objectRecordOperation.result.updateInput]
              : objectRecordOperation.result.updateInputs;

          const isGroupFieldUpdated =
            isDefined(recordIndexGroupFieldMetadataItem) &&
            updateInputs.some((updateInput) =>
              updateInput.updatedFields.some((updatedField) =>
                Object.keys(updatedField ?? {}).includes(
                  recordIndexGroupFieldMetadataItem.name,
                ),
              ),
            );

          if (
            isGroupFieldUpdated ||
            getShouldResetTableVirtualizationForUpdateInputs(updateInputs)
          ) {
            debouncedRefetchRecordGroup();
          }

          return;
        }
        default: {
          debouncedRefetchRecordGroup();
        }
      }
    },
    [
      currentRecordGroupId,
      debouncedRefetchRecordGroup,
      getShouldResetTableVirtualizationForUpdateInputs,
      recordGroupFromGroupValueCallbackState,
      recordIndexGroupFieldMetadataItem,
      store,
    ],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedRefetchRecordGroup,
  });
};
