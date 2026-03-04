import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordShowSidePanelActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <ActionMenuContextProvider
          isInSidePanel={true}
          displayType="dropdownItem"
          actionMenuType="command-menu-show-page-action-menu-dropdown"
        >
          <CommandMenuActionMenuDropdown />
        </ActionMenuContextProvider>
      )}
    </>
  );
};
