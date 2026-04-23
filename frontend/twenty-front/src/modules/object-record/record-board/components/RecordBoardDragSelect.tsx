import { RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-board/constants/RecordBoardClickOutsideListenerId';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useContext, type RefObject } from 'react';

export type RecordBoardDragSelectProps = {
  boardRef: RefObject<HTMLDivElement>;
};

export const RecordBoardDragSelect = ({
  boardRef,
}: RecordBoardDragSelectProps) => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { toggleClickOutside } = useClickOutsideListener(
    RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const handleDragSelectionStart = () => {
    closeAnyOpenDropdown();
    toggleClickOutside(false);
  };

  const handleDragSelectionEnd = () => {
    toggleClickOutside(true);
  };

  const { setRecordAsSelected } = useRecordBoardSelection();

  return (
    <DragSelect
      selectableItemsContainerRef={boardRef}
      onDragSelectionEnd={handleDragSelectionEnd}
      onDragSelectionChange={setRecordAsSelected}
      onDragSelectionStart={handleDragSelectionStart}
      scrollWrapperComponentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
      selectionBoundaryClass={RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS}
    />
  );
};
