import { useContext } from 'react';
import { RecordBoardCardMultiDragPreview } from '@/object-record/record-board/record-board-card/components/RecordBoardCardMultiDragPreview';
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
import { DragDropColumnSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropColumnSortableCell';
import { RECORD_BOARD_CARD_DND_TYPE } from '@/object-record/record-board/record-board-dnd/constants/RecordBoardCardDndType';

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
      {isRecordBoardCardFocused && <RecordBoardCardHotkeysEffect />}
      <DragDropColumnSortableCell
        id={recordId}
        index={rowIndex}
        group={group}
        type={RECORD_BOARD_CARD_DND_TYPE}
        accept={RECORD_BOARD_CARD_DND_TYPE}
        disabled={isRecordBoardDropProcessing}
      >
        <RecordBoardCard />
      </DragDropColumnSortableCell>
      <RecordBoardCardMultiDragPreview />
    </RecordBoardCardContext.Provider>
  );
};
