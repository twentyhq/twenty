import { type Draggable } from '@dnd-kit/dom';
import { isDefined } from 'twenty-shared/utils';

import { RECORD_CALENDAR_CARD_DRAG_OVERLAY_CALENDAR_DAY } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardDragOverlayCalendarDay';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { getRecordIdFromRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';
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

  if (!isDefined(source)) {
    return null;
  }

  return (
    <>
      <RecordCalendarCard
        recordId={recordId}
        calendarDay={RECORD_CALENDAR_CARD_DRAG_OVERLAY_CALENDAR_DAY}
        isDragOverlay
      />
      <RecordCalendarCardMultiDragPreview recordId={recordId} />
    </>
  );
};
