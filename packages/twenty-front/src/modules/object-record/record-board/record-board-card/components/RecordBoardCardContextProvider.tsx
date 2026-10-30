import { styled } from '@linaria/react';
import { memo, useContext } from 'react';

import { RecordBoardCardHotkeysEffect } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHotkeysEffect';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
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

// Memoized so appending a page to a column does not re-render every card already in it
export const RecordBoardCardContextProvider = memo(
  ({ recordId, rowIndex, group }: RecordBoardCardContextProviderProps) => {
    const { objectMetadataItem } = useContext(RecordBoardContext);
    const { columnIndex } = useContext(RecordBoardColumnContext);

    const isRecordReadOnlyFromPermissions = useIsRecordReadOnly({
      recordId,
      objectMetadataId: objectMetadataItem.id,
    });

    const isRecordBoardCellsNonEditable = useAtomComponentStateValue(
      isRecordBoardCellsNonEditableComponentState,
    );

    const isRecordReadOnly =
      isRecordBoardCellsNonEditable || isRecordReadOnlyFromPermissions;

    const isRecordBoardCardFocused = useAtomComponentFamilyStateValue(
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
        <DragDropItemSortableCell
          id={recordId}
          index={rowIndex}
          group={group}
          type={RECORD_BOARD_CARD_DND_TYPE}
          accept={RECORD_BOARD_CARD_DND_TYPE}
          data={{ recordId }}
          disabled={isRecordBoardCellsNonEditable}
        >
          <StyledDraggableContainer
            isDragDisabled={isRecordBoardCellsNonEditable}
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
  },
);
