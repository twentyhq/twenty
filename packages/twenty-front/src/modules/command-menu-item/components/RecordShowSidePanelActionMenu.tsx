import { CommandMenuItemActionMenuDropdown } from '@/command-menu-item/components/CommandMenuItemActionMenuDropdown';
import { CommandMenuItemContextProvider } from '@/command-menu-item/contexts/CommandMenuItemContextProvider';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordShowSidePanelActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <CommandMenuItemContextProvider
          isInSidePanel={true}
          displayType="dropdownItem"
          actionMenuType="command-menu-show-page-action-menu-dropdown"
        >
          <CommandMenuItemActionMenuDropdown />
        </CommandMenuItemContextProvider>
      )}
    </>
  );
};
