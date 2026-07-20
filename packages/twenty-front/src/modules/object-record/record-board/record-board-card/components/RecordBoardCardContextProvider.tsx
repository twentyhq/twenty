import { styled } from '@linaria/react';
import { useContext } from 'react';

import { RecordBoardCardHotkeysEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHotkeysEffect';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { RECORD_BOARD_CARD_DND_TYPE } from '@/object-record/record-board/record-board-dnd/constants/RecordBoardCardDndType';

const StyledDraggableContainer = styled.div<{
  isDragDisabled: boolean;
}>`
  cursor: ${({ isDragDisabled }) => (isDragDisabled ? 'default' : 'grab')};
  position: relative;
  scroll-margin-left: 8px;
  scroll-margin-right: 8px;
  scroll-margin-top: 40px;
`;

type RecordBoardCardContextProviderProps = {
  recordId: string;
  rowIndex: number;
  group: string;
};

export const RecordBoardCardContextProvider = ({
  recordId,
  rowIndex,
  group,
}: RecordBoardCardContextProviderProps) => {
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const { columnIndex } = useContext(RecordBoardColumnContext);

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const isRecordBoardCardFocused = useAtomComponentFamilyStateValue(
    isRecordBoardCardFocusedComponentFamilyState,
    {
      rowIndex,
      columnIndex,
    },
  );

  const isRecordBoardDropProcessing = useAtomComponentStateValue(
    isRecordBoardDropProcessingComponentState,
  );

  return (
    <RecordBoardCardContext.Provider
      value={{ recordId, isRecordReadOnly, rowIndex, columnIndex }}
    >
      <DragDropItemSortableCell
        id={recordId}
        index={rowIndex}
        group={group}
        type={RECORD_BOARD_CARD_DND_TYPE}
        accept={RECORD_BOARD_CARD_DND_TYPE}
        disabled={isRecordBoardDropProcessing}
      >
        <StyledDraggableContainer
          isDragDisabled={isRecordBoardDropProcessing}
          id={`record-board-card-${columnIndex}-${rowIndex}`}
          data-selectable-id={recordId}
          data-select-disable
        >
          {isRecordBoardCardFocused && <RecordBoardCardHotkeysEffect />}
          <RecordBoardCard />
        </StyledDraggableContainer>
      </DragDropItemSortableCell>
    </RecordBoardCardContext.Provider>
  );
};
