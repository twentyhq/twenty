import { hasInitializedRecordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/hasInitializedRecordCalendarSelectedDateComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

export const RecordIndexCalendarSelectedDateInitEffect = () => {
  const [, setRecordCalendarSelectedDate] = useRecoilComponentState(
    recordCalendarSelectedDateComponentState,
  );

  const [
    hasInitializedRecordCalendarSelectedDate,
    setHasInitializedRecordCalendarSelectedDate,
  ] = useRecoilComponentState(
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
