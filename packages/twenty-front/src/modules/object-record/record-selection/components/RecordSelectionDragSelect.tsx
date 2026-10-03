import { useStore } from 'jotai';
import { type RefObject, useCallback } from 'react';

import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndexDragSelectBoundaryClass';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

type RecordSelectionDragSelectProps = {
  selectableItemsContainerRef: RefObject<HTMLElement | null>;
  onDragSelectionStart?: () => void;
  onDragSelectionEnd?: () => void;
};

export const RecordSelectionDragSelect = ({
  selectableItemsContainerRef,
  onDragSelectionStart,
  onDragSelectionEnd,
}: RecordSelectionDragSelectProps) => {
  const store = useStore();
  const isRecordSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
  );

  const handleDragSelectionChange = useCallback(
    (recordId: string, isSelected: boolean) => {
      const isRecordSelectedAtom = isRecordSelectedFamilyState(recordId);

      if (store.get(isRecordSelectedAtom) !== isSelected) {
        store.set(isRecordSelectedAtom, isSelected);
      }
    },
    [isRecordSelectedFamilyState, store],
  );

  const handleDragSelectionEnd = () => {
    // A drag that ends on the record it started from also clicks it, which
    // would open the record and drop the selection
    const preventClick = (event: MouseEvent) => {
      if (
        !(event.target instanceof Node) ||
        !selectableItemsContainerRef.current?.contains(event.target)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('click', preventClick, {
      capture: true,
      once: true,
    });
    setTimeout(() =>
      window.removeEventListener('click', preventClick, { capture: true }),
    );

    onDragSelectionEnd?.();
  };

  return (
    <DragSelect
      selectableItemsContainerRef={selectableItemsContainerRef}
      onDragSelectionStart={onDragSelectionStart}
      onDragSelectionChange={handleDragSelectionChange}
      onDragSelectionEnd={handleDragSelectionEnd}
      selectionBoundaryClass={RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS}
    />
  );
};
