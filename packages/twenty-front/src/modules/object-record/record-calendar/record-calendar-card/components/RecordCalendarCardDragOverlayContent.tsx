import { type Draggable } from '@dnd-kit/dom';
import { isDefined } from 'twenty-shared/utils';

import { RECORD_CALENDAR_CARD_DRAG_OVERLAY_CALENDAR_DAY } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardDragOverlayCalendarDay';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { RecordDragMultiDragCounterChip } from '@/object-record/record-drag/components/RecordDragMultiDragCounterChip';
import { type RecordDragData } from '@/object-record/record-drag/types/RecordDragData';

type RecordCalendarCardDragOverlayContentProps = {
  source: Draggable | null;
};
export const RecordCalendarCardDragOverlayContent = ({
  source,
}: RecordCalendarCardDragOverlayContentProps) => {
  const sourceData = source?.data as RecordDragData | undefined;

  if (!isDefined(sourceData)) {
    return null;
  }

  return (
    <>
      <RecordCalendarCard
        recordId={sourceData.recordId}
        calendarDay={RECORD_CALENDAR_CARD_DRAG_OVERLAY_CALENDAR_DAY}
        isDragOverlay
      />
      <RecordDragMultiDragCounterChip />
    </>
  );
};
