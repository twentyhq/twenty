import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { RecordCalendarTimeGrid } from '@/object-record/record-calendar/time-grid/components/RecordCalendarTimeGrid';
import { useRecordCalendarWeekDaysRange } from '@/object-record/record-calendar/week/hooks/useRecordCalendarWeekDaysRange';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const RECORD_CALENDAR_WEEK_MIN_WIDTH_IN_PIXELS = 1000;

export const RecordCalendarWeek = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );
  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
    recordCalendarId,
  );
  const { weekDays } = useRecordCalendarWeekDaysRange(
    recordCalendarSelectedDate,
  );

  return (
    <RecordCalendarTimeGrid
      days={weekDays}
      minWidthInPixels={RECORD_CALENDAR_WEEK_MIN_WIDTH_IN_PIXELS}
    />
  );
};
