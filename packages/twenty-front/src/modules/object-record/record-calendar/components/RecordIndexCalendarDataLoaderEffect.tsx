import { useRecordCalendarGroupByRecords } from '@/object-record/record-calendar/hooks/useRecordCalendarGroupByRecords';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { hasInitializedRecordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/hasInitializedRecordCalendarSelectedDateComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect } from 'react';

export const RecordIndexCalendarDataLoaderEffect = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
    recordCalendarId,
  );

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const setRecordIndexRecordIdsByGroup = useSetAtomComponentFamilyState(
    recordIndexRecordIdsByGroupComponentFamilyState,
    NO_RECORD_GROUP_FAMILY_KEY,
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
    setRecordIndexRecordIdsByGroup(recordIds);
  }, [
    hasInitializedRecordCalendarSelectedDate,
    records,
    setRecordIndexRecordIdsByGroup,
    upsertRecordsInStore,
  ]);

  return <></>;
};
