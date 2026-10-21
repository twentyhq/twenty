import { RECORD_BOARD_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-board/constants/RecordBoardClickOutsideListenerId';
import { RecordSelectionDragSelect } from '@/object-record/record-selection/components/RecordSelectionDragSelect';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { type RefObject } from 'react';

export type RecordBoardDragSelectProps = {
  boardRef: RefObject<HTMLDivElement | null>;
};

export const RecordBoardDragSelect = ({
  boardRef,
}: RecordBoardDragSelectProps) => {
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

  return (
    <RecordSelectionDragSelect
      selectableItemsContainerRef={boardRef}
      onDragSelectionStart={handleDragSelectionStart}
      onDragSelectionEnd={handleDragSelectionEnd}
    />
  );
};
