import { type Draggable } from '@dnd-kit/dom';
import { isDefined } from 'twenty-shared/utils';

import { RecordCalendarMonthContextProvider } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import { RECORD_CALENDAR_CARD_DRAG_OVERLAY_CALENDAR_DAY } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardDragOverlayCalendarDay';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { getRecordIdFromRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { RecordCalendarCardMultiDragPreview } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardMultiDragPreview';

type RecordCalendarCardDragOverlayContentProps = {
  source: Draggable | null;
};
export const RecordCalendarCardDragOverlayContent = ({
  source,
}: RecordCalendarCardDragOverlayContentProps) => {
  const recordId = isDefined(source)
    ? getRecordIdFromRecordCalendarCardDraggableId(String(source.id))
    : '';

  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
  );

  const {
    firstDayOfMonth,
    lastDayOfMonth,
    firstDayOfFirstWeek,
    lastDayOfLastWeek,
    weekDayLabels,
    weekFirstDays,
    weekStartsOnDayIndex,
  } = useRecordCalendarMonthDaysRange(recordCalendarSelectedDate);

  if (!isDefined(source)) {
    return null;
  }

  return (
    <RecordCalendarMonthContextProvider
      value={{
        firstDayOfMonth,
        lastDayOfMonth,
        firstDayOfFirstWeek,
        lastDayOfLastWeek,
        weekDayLabels,
        weekFirstDays,
        weekStartsOnDayIndex,
      }}
    >
      <RecordCalendarCard
        recordId={recordId}
        calendarDay={RECORD_CALENDAR_CARD_DRAG_OVERLAY_CALENDAR_DAY}
        isDragOverlay
      />
      <RecordCalendarCardMultiDragPreview recordId={recordId} />
    </RecordCalendarMonthContextProvider>
  );
};
