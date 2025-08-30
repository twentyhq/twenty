import { RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID } from '@/object-record/record-group/constants/RecordGroupReorderConfirmationModalId';
import { useReorderRecordGroups } from '@/object-record/record-group/hooks/useReorderRecordGroups';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { recordIndexRecordGroupIsDraggableSortComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexRecordGroupIsDraggableSortComponentSelector';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type ViewType } from '@/views/types/ViewType';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useState } from 'react';

type UseRecordGroupReorderConfirmationModalParams = {
  recordIndexId: string;
  viewType: ViewType;
};

export const useRecordGroupReorderConfirmationModal = ({
  recordIndexId,
  viewType,
}: UseRecordGroupReorderConfirmationModalParams) => {
  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { openModal } = useModal();

  const [pendingDragEndHandlerParams, setPendingDragEndHandlerParams] =
    useState<Parameters<OnDragEndResponder> | null>(null);

  const { reorderRecordGroups } = useReorderRecordGroups({
    recordIndexId,
    viewType,
  });

  const handleDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }

    reorderRecordGroups({
      fromIndex: result.source.index - 1,
      toIndex: result.destination.index - 1,
    });
  };
  const isDragableSortRecordGroup = useRecoilComponentValue(
    recordIndexRecordGroupIsDraggableSortComponentSelector,
  );

  const setRecordGroupSort = useSetRecoilComponentState(
    recordIndexRecordGroupSortComponentState,
  );
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const handleDragEndWithModal: OnDragEndResponder = (result, provided) => {
    if (!isDragableSortRecordGroup) {
      closeAnyOpenDropdown();
      openModal(RECORD_GROUP_REORDER_CONFIRMATION_MODAL_ID);
      setActiveDropdownFocusIdAndMemorizePrevious(null);
      setPendingDragEndHandlerParams([result, provided]);
    } else {
      handleDragEnd(result, provided);
    }
  };

  const handleConfirmClick = () => {
    if (!pendingDragEndHandlerParams) {
      throw new Error('pendingDragEndReorder is not set');
    }

    setRecordGroupSort(RecordGroupSort.Manual);
    setPendingDragEndHandlerParams(null);
    handleDragEnd(...pendingDragEndHandlerParams);
    goBackToPreviousDropdownFocusId();
  };

  return {
    handleRecordGroupOrderChangeWithModal: handleDragEndWithModal,
    handleRecordGroupReorderConfirmClick: handleConfirmClick,
  };
};
