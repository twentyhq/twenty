import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useEffect } from 'react';

type CalendarEventDetailsEffectProps = {
  record: CalendarEvent;
};

export const CalendarEventDetailsEffect = ({
  record,
}: CalendarEventDetailsEffectProps) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    if (!record) {
      return;
    }

    upsertRecordsInStore({ partialRecords: [record] });
  }, [record, upsertRecordsInStore]);

  return <></>;
};
