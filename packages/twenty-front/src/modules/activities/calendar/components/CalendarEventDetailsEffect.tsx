import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useSetRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useEffect } from 'react';

type CalendarEventDetailsEffectProps = {
  record: CalendarEvent;
};

export const CalendarEventDetailsEffect = ({
  record,
}: CalendarEventDetailsEffectProps) => {
  const { upsertRecords } = useUpsertRecordsInStore();
  const setRecordValueInContextSelector = useSetRecordValue();

  useEffect(() => {
    if (!record) {
      return;
    }

    upsertRecords([record]);
    setRecordValueInContextSelector(record.id, record);
  }, [record, upsertRecords, setRecordValueInContextSelector]);

  return <></>;
};
