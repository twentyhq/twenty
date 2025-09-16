import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';

import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';

const StyledDraggableContainer = styled.div`
  position: relative;
  scroll-margin-left: 8px;
  scroll-margin-right: 8px;
  scroll-margin-top: 8px;
`;

export const RecordCalendarCardDraggableContainer = ({
  recordId,
  index,
}: {
  recordId: string;
  index: number;
}) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  return (
    <RecordCalendarCardComponentInstanceContext.Provider
      value={{ instanceId: recordId }}
    >
      <Draggable
        key={recordId}
        draggableId={recordId}
        index={index}
        isDragDisabled={isRecordReadOnly}
      >
        {(draggableProvided) => (
          <StyledDraggableContainer
            id={`record-calendar-card-${recordId}`}
            ref={draggableProvided?.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.dragHandleProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.draggableProps}
            data-selectable-id={recordId}
          >
            <RecordCalendarCard recordId={recordId} />
          </StyledDraggableContainer>
        )}
      </Draggable>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
