import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { ActionBar } from '@/ui/navigation/action-menu/components/ActionBar';
import { ActionMenuDropdown } from '@/ui/navigation/action-menu/components/ActionMenuDropdown';
import { NavigationModal } from '@/ui/navigation/action-menu/components/NavigationModal';
import { actionMenuDropdownIsOpenState } from '@/ui/navigation/action-menu/states/actionMenuDropdownIsOpenState';
import { actionMenuEntriesState } from '@/ui/navigation/action-menu/states/actionMenuEntriesState';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

export const ActionMenu = () => {
  const setActionMenuDropdownOpenState = useSetRecoilState(
    actionMenuDropdownIsOpenState,
  );

  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  useEffect(() => {
    if (contextStoreTargetedRecordIds.length !== 1) {
      setActionMenuDropdownOpenState(false);
    }
  }, [contextStoreTargetedRecordIds, setActionMenuDropdownOpenState]);

  const actionMenuDropdownIsOpen = useRecoilValue(
    actionMenuDropdownIsOpenState,
  );
  const actionMenuEntries = useRecoilValue(actionMenuEntriesState);

  if (!contextStoreTargetedRecordIds.length) {
    return null;
  }

  return (
    <>
      {!actionMenuDropdownIsOpen && (
        <ActionBar
          selectedRecordIds={contextStoreTargetedRecordIds}
          actionMenuEntries={actionMenuEntries}
        />
      )}
      {actionMenuDropdownIsOpen && (
        <ActionMenuDropdown actionMenuEntries={actionMenuEntries} />
      )}
      <NavigationModal actionMenuEntries={actionMenuEntries} />
    </>
  );
};
