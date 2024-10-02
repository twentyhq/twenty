import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { ActionBar } from '@/ui/navigation/action-menu/components/ActionBar';
import { ActionMenuDropdown } from '@/ui/navigation/action-menu/components/ActionMenuDropdown';
import { NavigationModal } from '@/ui/navigation/action-menu/components/NavigationModal';
import { actionMenuEntriesState } from '@/ui/navigation/action-menu/states/actionMenuEntriesState';
import { contextMenuIsOpenState } from '@/ui/navigation/action-menu/states/contextMenuIsOpenState';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

export const ActionMenu = () => {
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  useEffect(() => {
    if (contextStoreTargetedRecordIds.length > 1) {
      setContextMenuOpenState(false);
    }
  }, [contextStoreTargetedRecordIds, setContextMenuOpenState]);

  const contextMenuIsOpen = useRecoilValue(contextMenuIsOpenState);
  const actionMenuEntries = useRecoilValue(actionMenuEntriesState);

  if (!contextStoreTargetedRecordIds.length) {
    return null;
  }

  return (
    <>
      {!contextMenuIsOpen && (
        <ActionBar
          selectedRecordIds={contextStoreTargetedRecordIds}
          actionMenuEntries={actionMenuEntries}
        />
      )}
      {contextMenuIsOpen && (
        <ActionMenuDropdown actionMenuEntries={actionMenuEntries} />
      )}
      <NavigationModal actionMenuEntries={actionMenuEntries} />
    </>
  );
};
