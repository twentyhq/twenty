import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { useContext } from 'react';

import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardCardFocusHotkeyEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardCardFocusHotkeyEffect';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { isBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isBoardCardFocusedComponentFamilyState';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';

const StyledDraggableContainer = styled.div`
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
  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
  });

  const { columnIndex } = useContext(RecordBoardColumnContext);

  const isRecordBoardCardFocusActive = useRecoilComponentFamilyValueV2(
    isBoardCardFocusedComponentFamilyState,
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
            className="record-board-card"
            data-selectable-id={recordId}
            data-select-disable
          >
            {isRecordBoardCardFocusActive && (
              <RecordBoardCardFocusHotkeyEffect />
            )}
            <RecordBoardCard />
          </StyledDraggableContainer>
        )}
      </Draggable>
    </RecordBoardCardContext.Provider>
  );
};
