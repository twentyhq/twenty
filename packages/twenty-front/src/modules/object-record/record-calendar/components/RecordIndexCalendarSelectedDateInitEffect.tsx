import { hasInitializedRecordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/hasInitializedRecordCalendarSelectedDateComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

export const RecordIndexCalendarSelectedDateInitEffect = () => {
  const [, setRecordCalendarSelectedDate] = useRecoilComponentStateV2(
    recordCalendarSelectedDateComponentState,
  );

  const [
    hasInitializedRecordCalendarSelectedDate,
    setHasInitializedRecordCalendarSelectedDate,
  ] = useRecoilComponentStateV2(
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
