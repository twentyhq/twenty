import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { recordIndexRecordGroupIsDraggableSortComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexRecordGroupIsDraggableSortComponentSelector';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export const useRecordGroupReorderConfirmationModal = (
  recordIndexId: string,
) => {
  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const [isReorderConfirmationModalOpen, setIsReorderConfirmationModalOpen] =
    useState(false);

  const [pendingDragEndReorder, setPendingDragEndReorder] =
    useState<Parameters<OnDragEndResponder> | null>(null);

  const { handleOrderChange: handleRecordGroupOrderChange } =
    useRecordGroupReorder({
      viewBarId: recordIndexId,
    });

  const isDragableSortRecordGroup = useRecoilComponentValueV2(
    recordIndexRecordGroupIsDraggableSortComponentSelector,
  );

  const [recordGroupSort, setRecordGroupSort] = useRecoilComponentStateV2(
    recordIndexRecordGroupSortComponentState,
  );

  const handleRecordGroupOrderChangeWithModal: OnDragEndResponder = (
    result,
    provided,
  ) => {
    if (!isDragableSortRecordGroup) {
      setIsReorderConfirmationModalOpen(true);
      setActiveDropdownFocusIdAndMemorizePrevious(null);
      setPendingDragEndReorder([result, provided]);
    } else {
      handleRecordGroupOrderChange(result, provided);
    }
  };

  const handleConfirmClick = () => {
    if (!pendingDragEndReorder) {
      throw new Error('pendingDragEndReorder is not set');
    }

    setRecordGroupSort(RecordGroupSort.Manual);
    setPendingDragEndReorder(null);
    handleRecordGroupOrderChange(...pendingDragEndReorder);
    goBackToPreviousDropdownFocusId();
  };

  return {
    handleRecordGroupOrderChangeWithModal,
    RecordGroupReorderConfirmationModal: isReorderConfirmationModalOpen
      ? createPortal(
          <ConfirmationModal
            isOpen={isReorderConfirmationModalOpen}
            setIsOpen={setIsReorderConfirmationModalOpen}
            title="Group sorting"
            subtitle={`Would you like to remove ${recordGroupSort} group sorting`}
            onConfirmClick={handleConfirmClick}
            deleteButtonText="Remove"
          />,
          document.body,
        )
      : null,
  };
};
