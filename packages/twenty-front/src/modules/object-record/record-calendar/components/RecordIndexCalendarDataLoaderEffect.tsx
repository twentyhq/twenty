import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecordCalendarGroupByRecords } from '@/object-record/record-calendar/hooks/useRecordCalendarGroupByRecords';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { hasInitializedRecordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/hasInitializedRecordCalendarSelectedDateComponentState';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordCalendarSelectedRecordIdsComponentSelector } from '@/object-record/record-calendar/states/selectors/recordCalendarSelectedRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

export const RecordIndexCalendarDataLoaderEffect = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const selectedRecordIds = useAtomComponentSelectorValue(
    recordCalendarSelectedRecordIdsComponentSelector,
    recordCalendarId,
  );

  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
    recordCalendarId,
  );

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const setContextStoreTargetedRecords = useSetAtomComponentState(
    contextStoreTargetedRecordsRuleComponentState,
    recordCalendarId,
  );

  const setRecordCalendarRecordIds = useSetAtomComponentState(
    recordCalendarRecordIdsComponentState,
    recordCalendarId,
  );

  const { records } = useRecordCalendarGroupByRecords(
    recordCalendarSelectedDate,
  );

  const hasInitializedRecordCalendarSelectedDate = useAtomComponentStateValue(
    hasInitializedRecordCalendarSelectedDateComponentState,
    recordCalendarId,
  );

  useEffect(() => {
    if (!hasInitializedRecordCalendarSelectedDate) {
      return;
    }

    upsertRecordsInStore({ partialRecords: records });
    const recordIds = records.map((record) => record.id);
    setRecordCalendarRecordIds(recordIds);
  }, [
    hasInitializedRecordCalendarSelectedDate,
    records,
    setRecordCalendarRecordIds,
    upsertRecordsInStore,
  ]);

  useEffect(() => {
    setContextStoreTargetedRecords({
      mode: 'selection',
      selectedRecordIds,
    });

    return () => {
      setContextStoreTargetedRecords({
        mode: 'selection',
        selectedRecordIds: [],
      });
    };
  }, [selectedRecordIds, setContextStoreTargetedRecords]);

  return <></>;
};
