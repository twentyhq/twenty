import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRecordBoardSelection = (recordBoardId?: string) => {
  const instanceIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordBoardComponentInstanceContext,
    recordBoardId,
  );

  const selectedRecordIds = useAtomComponentSelectorCallbackState(
    selectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const { closeDropdown } = useCloseDropdown();
  const store = useStore();

  const dropdownId = getCommandMenuDropdownIdFromCommandMenuId(
    getCommandMenuIdFromRecordIndexId(instanceIdFromProps),
  );

  const checkIfLastUnselectAndCloseDropdown = useCallback(() => {
    const recordIds = store.get(selectedRecordIds);

    if (recordIds.length === 0) {
      closeDropdown(dropdownId);
    }
  }, [selectedRecordIds, store, closeDropdown, dropdownId]);

  return {
    checkIfLastUnselectAndCloseDropdown,
  };
};
