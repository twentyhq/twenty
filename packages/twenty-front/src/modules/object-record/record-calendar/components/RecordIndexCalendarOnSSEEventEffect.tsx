import { useListenToObjectRecordOperationBrowserEvent } from '@/object-record/hooks/useListenToObjectRecordOperationBrowserEvent';
import { recordCalendarShouldBeRefetchedComponentState } from '@/object-record/record-calendar/states/recordCalendarShouldBeRefetchedComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type ObjectRecordOperationBrowserEventDetail } from '@/object-record/types/ObjectRecordOperationBrowserEventDetail';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

export const RecordIndexCalendarOnSSEEventEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordCalendarShouldBeRefetchedCallbackState =
    useRecoilComponentCallbackState(
      recordCalendarShouldBeRefetchedComponentState,
    );

  const handleObjectRecordOperation = useRecoilCallback(
    ({ set }) =>
      (
        _objectRecordOperationEventDetail: ObjectRecordOperationBrowserEventDetail,
      ) => {
        set(recordCalendarShouldBeRefetchedCallbackState, true);
      },
    [recordCalendarShouldBeRefetchedCallbackState],
  );

  const debouncedHandleObjectRecordOperation = useDebouncedCallback(
    handleObjectRecordOperation,
    1000,
    { leading: true },
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: debouncedHandleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem?.id,
  });

  return null;
};
