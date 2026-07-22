import { styled } from '@linaria/react';

import { RECORD_CALENDAR_CARD_DND_TYPE } from '@/object-record/record-calendar/month/constants/RecordCalendarCardDndType';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { useIsRecordCalendarCardDragDisabled } from '@/object-record/record-calendar/record-calendar-card/hooks/useIsRecordCalendarCardDragDisabled';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { getRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';

const StyledDraggableContainer = styled.div`
  position: relative;
  scroll-margin-left: 8px;
  scroll-margin-right: 8px;
  scroll-margin-top: 8px;
`;

export const RecordCalendarCardDraggableContainer = ({
  calendarDay,
  recordId,
  index,
}: {
  calendarDay: string;
  recordId: string;
  index: number;
}) => {
  const dragIsDisabled = useIsRecordCalendarCardDragDisabled(recordId);

  const draggableId = getRecordCalendarCardDraggableId({
    calendarDay,
    recordId,
  });

  return (
    <RecordCalendarCardComponentInstanceContext.Provider
      value={{ instanceId: recordId }}
    >
      <DragDropItemSortableCell
        id={draggableId}
        index={index}
        group={calendarDay}
        type={RECORD_CALENDAR_CARD_DND_TYPE}
        accept={RECORD_CALENDAR_CARD_DND_TYPE}
        disabled={dragIsDisabled}
      >
        <StyledDraggableContainer
          id={`record-calendar-card-${recordId}-${calendarDay}`}
          data-selectable-id={recordId}
        >
          <RecordCalendarCard recordId={recordId} />
        </StyledDraggableContainer>
      </DragDropItemSortableCell>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
