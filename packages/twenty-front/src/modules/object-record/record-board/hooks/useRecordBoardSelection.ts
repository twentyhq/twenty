import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRecordBoardSelection = (recordBoardId?: string) => {
  const instanceIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
    recordBoardId,
  );

  const isRecordBoardCardSelectedFamilyState =
    useAtomComponentFamilyStateCallbackState(
      isRecordBoardCardSelectedComponentFamilyState,
      recordBoardId,
    );

  const recordBoardSelectedRecordIds = useAtomComponentSelectorCallbackState(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const { closeDropdown } = useCloseDropdown();
  const store = useStore();

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(
    getActionMenuIdFromRecordIndexId(instanceIdFromProps),
  );

  const setRecordAsSelected = useCallback(
    (recordId: string, isSelected: boolean) => {
      const atom = isRecordBoardCardSelectedFamilyState(recordId);
      const isRecordCurrentlySelected = store.get(atom);

      if (isRecordCurrentlySelected === isSelected) {
        return;
      }

      store.set(atom, isSelected);
    },
    [isRecordBoardCardSelectedFamilyState, store],
  );

  const checkIfLastUnselectAndCloseDropdown = useCallback(() => {
    const recordIds = store.get(recordBoardSelectedRecordIds);

    if (recordIds.length === 0) {
      closeDropdown(dropdownId);
    }
  }, [recordBoardSelectedRecordIds, store, closeDropdown, dropdownId]);

  return {
    setRecordAsSelected,
    checkIfLastUnselectAndCloseDropdown,
  };
};
