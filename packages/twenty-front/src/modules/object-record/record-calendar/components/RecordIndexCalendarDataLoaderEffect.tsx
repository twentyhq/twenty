import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecordCalendarGroupByRecords } from '@/object-record/record-calendar/hooks/useRecordCalendarGroupByRecords';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { hasInitializedRecordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/hasInitializedRecordCalendarSelectedDateComponentState';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordCalendarSelectedRecordIdsComponentSelector } from '@/object-record/record-calendar/states/selectors/recordCalendarSelectedRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const RecordIndexCalendarDataLoaderEffect = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const selectedRecordIds = useRecoilComponentSelectorValueV2(
    recordCalendarSelectedRecordIdsComponentSelector,
    recordCalendarId,
  );

  const recordCalendarSelectedDate = useRecoilComponentValueV2(
    recordCalendarSelectedDateComponentState,
    recordCalendarId,
  );

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const setContextStoreTargetedRecords = useSetRecoilComponentStateV2(
    contextStoreTargetedRecordsRuleComponentState,
    recordCalendarId,
  );

  const setRecordCalendarRecordIds = useSetRecoilComponentStateV2(
    recordCalendarRecordIdsComponentState,
    recordCalendarId,
  );

  const { records } = useRecordCalendarGroupByRecords(
    recordCalendarSelectedDate,
  );

  const hasInitializedRecordCalendarSelectedDate = useRecoilComponentValueV2(
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
