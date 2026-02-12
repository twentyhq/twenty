import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecordCalendarGroupByRecords } from '@/object-record/record-calendar/hooks/useRecordCalendarGroupByRecords';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { hasInitializedRecordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/hasInitializedRecordCalendarSelectedDateComponentState';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordCalendarSelectedRecordIdsComponentSelector } from '@/object-record/record-calendar/states/selectors/recordCalendarSelectedRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

export const RecordIndexCalendarDataLoaderEffect = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const selectedRecordIds = useRecoilComponentValue(
    recordCalendarSelectedRecordIdsComponentSelector,
    recordCalendarId,
  );

  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const setContextStoreTargetedRecords = useSetRecoilComponentState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setRecordCalendarRecordIds = useSetRecoilComponentState(
    recordCalendarRecordIdsComponentState,
  );

  const { records } = useRecordCalendarGroupByRecords(
    recordCalendarSelectedDate,
  );

  const hasInitializedRecordCalendarSelectedDate = useRecoilComponentValue(
    hasInitializedRecordCalendarSelectedDateComponentState,
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
