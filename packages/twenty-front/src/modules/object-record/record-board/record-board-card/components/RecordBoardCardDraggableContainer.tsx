import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { useContext } from 'react';

import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardCardHotkeysEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHotkeysEffect';
import { RecordBoardCardMultiDragPreview } from '@/object-record/record-board/record-board-card/components/RecordBoardCardMultiDragPreview';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { DragAndDropLibraryLegacyReRenderBreaker } from '@/ui/drag-and-drop/components/DragAndDropReRenderBreaker';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';

const StyledDraggableContainer = styled.div`
  position: relative;
  scroll-margin-left: 8px;
  scroll-margin-right: 8px;
  scroll-margin-top: 40px;
`;

export const RecordBoardCardDraggableContainer = ({
  recordId,
  rowIndex,
}: {
  recordId: string;
  rowIndex: number;
}) => {
  const { objectMetadataItem } = useContext(RecordBoardContext);

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const { columnIndex } = useContext(RecordBoardColumnContext);

  const isRecordBoardCardFocusActive = useRecoilComponentFamilyValue(
    isRecordBoardCardFocusedComponentFamilyState,
    {
      rowIndex,
      columnIndex,
    },
  );

  return (
    <RecordBoardCardContext.Provider
      value={{ recordId, isRecordReadOnly, rowIndex, columnIndex }}
    >
      <Draggable key={recordId} draggableId={recordId} index={rowIndex}>
        {(draggableProvided) => (
          <StyledDraggableContainer
            id={`record-board-card-${columnIndex}-${rowIndex}`}
            ref={draggableProvided?.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.dragHandleProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided?.draggableProps}
            data-selectable-id={recordId}
            data-select-disable
          >
            <DragAndDropLibraryLegacyReRenderBreaker memoizationId={recordId}>
              {isRecordBoardCardFocusActive && <RecordBoardCardHotkeysEffect />}
              <RecordBoardCard />
              <RecordBoardCardMultiDragPreview />
            </DragAndDropLibraryLegacyReRenderBreaker>
          </StyledDraggableContainer>
        )}
      </Draggable>
    </RecordBoardCardContext.Provider>
  );
};
