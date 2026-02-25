import { hasInitializedRecordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/hasInitializedRecordCalendarSelectedDateComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

export const RecordIndexCalendarSelectedDateInitEffect = () => {
  const [, setRecordCalendarSelectedDate] = useAtomComponentState(
    recordCalendarSelectedDateComponentState,
  );

  const [
    hasInitializedRecordCalendarSelectedDate,
    setHasInitializedRecordCalendarSelectedDate,
  ] = useAtomComponentState(
    hasInitializedRecordCalendarSelectedDateComponentState,
  );

  const { userTimezone } = useUserTimezone();

  useEffect(() => {
    if (!hasInitializedRecordCalendarSelectedDate) {
      setRecordCalendarSelectedDate(
        Temporal.Now.zonedDateTimeISO(userTimezone).toPlainDate(),
      );
      setHasInitializedRecordCalendarSelectedDate(true);
    }
  }, [
    hasInitializedRecordCalendarSelectedDate,
    setHasInitializedRecordCalendarSelectedDate,
    setRecordCalendarSelectedDate,
    userTimezone,
  ]);

  return <></>;
};
