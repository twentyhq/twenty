import { ActionBar } from '@/action-menu/components/ActionBar';
import { ActionMenuDropdown } from '@/action-menu/components/ActionMenuDropdown';
import { ActionMenuNavigationModal } from '@/action-menu/components/ActionMenuNavigationModal';
import { actionMenuDropdownIsOpenState } from '@/action-menu/states/actionMenuDropdownIsOpenState';
import { actionMenuEntriesState } from '@/action-menu/states/actionMenuEntriesState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
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
      <ActionMenuNavigationModal actionMenuEntries={actionMenuEntries} />
    </>
  );
};
