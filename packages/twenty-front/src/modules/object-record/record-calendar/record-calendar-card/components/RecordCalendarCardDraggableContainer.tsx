import { styled } from '@linaria/react';
import { Draggable } from '@hello-pangea/dnd';

import { getCssCompatibleDraggableProps } from '@/ui/layout/draggable-list/utils/getCssCompatibleDraggableProps';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { useIsRecordCalendarCardDragDisabled } from '@/object-record/record-calendar/record-calendar-card/hooks/useIsRecordCalendarCardDragDisabled';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { getRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';

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
      <Draggable
        key={draggableId}
        draggableId={draggableId}
        index={index}
        isDragDisabled={dragIsDisabled}
      >
        {(draggableProvided) => (
          <StyledDraggableContainer
            id={`record-calendar-card-${recordId}-${calendarDay}`}
            ref={draggableProvided?.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.dragHandleProps}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...getCssCompatibleDraggableProps(
              draggableProvided.draggableProps,
            )}
            data-selectable-id={recordId}
          >
            <RecordCalendarCard recordId={recordId} />
          </StyledDraggableContainer>
        )}
      </Draggable>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
