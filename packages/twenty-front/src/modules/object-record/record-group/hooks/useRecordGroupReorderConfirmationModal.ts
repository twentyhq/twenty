import { useReorderRecordGroups } from '@/object-record/record-group/hooks/useReorderRecordGroups';
import { isRecordGroupReorderConfirmationModalVisibleState } from '@/object-record/record-group/states/isRecordGroupReorderConfirmationModalVisibleState';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { recordIndexRecordGroupIsDraggableSortComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexRecordGroupIsDraggableSortComponentSelector';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewType } from '@/views/types/ViewType';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';

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

  const setIsRecordGroupReorderConfirmationModalVisible = useSetRecoilState(
    isRecordGroupReorderConfirmationModalVisibleState,
  );

  const [pendingDragEndHandlerParams, setPendingDragEndHandlerParams] =
    useState<Parameters<OnDragEndResponder> | null>(null);

  const { reorderRecordGroups } = useReorderRecordGroups({
    viewBarId: recordIndexId,
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
  const isDragableSortRecordGroup = useRecoilComponentValueV2(
    recordIndexRecordGroupIsDraggableSortComponentSelector,
  );

  const setRecordGroupSort = useSetRecoilComponentStateV2(
    recordIndexRecordGroupSortComponentState,
  );
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();
  
  const handleDragEndWithModal: OnDragEndResponder = (result, provided) => {
    if (!isDragableSortRecordGroup) {
      closeAnyOpenDropdown();
      setIsRecordGroupReorderConfirmationModalVisible(true);
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
