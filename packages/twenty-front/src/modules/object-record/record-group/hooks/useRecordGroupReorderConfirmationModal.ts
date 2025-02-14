import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { isRecordGroupReorderConfirmationModalVisibleState } from '@/object-record/record-group/states/isRecordGroupReorderConfirmationModalVisibleState';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { recordIndexRecordGroupIsDraggableSortComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexRecordGroupIsDraggableSortComponentSelector';
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

  const [pendingDragEndReorder, setPendingDragEndReorder] =
    useState<Parameters<OnDragEndResponder> | null>(null);

  const { handleOrderChange: handleRecordGroupOrderChange } =
    useRecordGroupReorder({
      viewBarId: recordIndexId,
      viewType,
    });

  const isDragableSortRecordGroup = useRecoilComponentValueV2(
    recordIndexRecordGroupIsDraggableSortComponentSelector,
  );

  const setRecordGroupSort = useSetRecoilComponentStateV2(
    recordIndexRecordGroupSortComponentState,
  );

  const handleRecordGroupOrderChangeWithModal: OnDragEndResponder = (
    result,
    provided,
  ) => {
    if (!isDragableSortRecordGroup) {
      setIsRecordGroupReorderConfirmationModalVisible(true);
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
    handleRecordGroupReorderConfirmClick: handleConfirmClick,
  };
};
