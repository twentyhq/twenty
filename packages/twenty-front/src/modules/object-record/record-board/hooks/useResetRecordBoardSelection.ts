import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useResetRecordBoardSelection = (recordBoardId?: string) => {
  const instanceIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
    recordBoardId,
  );

  const isRecordBoardCardSelectedFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      isRecordBoardCardSelectedComponentFamilyState,
      recordBoardId,
    );

  const recordBoardSelectedRecordIdsAtom =
    useRecoilComponentSelectorCallbackStateV2(
      recordBoardSelectedRecordIdsComponentSelector,
      recordBoardId,
    );

  const { closeDropdown } = useCloseDropdown();
  const store = useStore();

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(
    getActionMenuIdFromRecordIndexId(instanceIdFromProps),
  );

  const resetRecordBoardSelection = useCallback(() => {
    closeDropdown(dropdownId);

    const recordIds = store.get(recordBoardSelectedRecordIdsAtom);

    for (const recordId of recordIds) {
      store.set(isRecordBoardCardSelectedFamilyState(recordId), false);
    }
  }, [
    closeDropdown,
    dropdownId,
    recordBoardSelectedRecordIdsAtom,
    isRecordBoardCardSelectedFamilyState,
    store,
  ]);

  return {
    resetRecordBoardSelection,
  };
};
