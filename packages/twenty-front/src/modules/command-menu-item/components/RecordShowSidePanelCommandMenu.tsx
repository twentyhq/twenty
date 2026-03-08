import { RecordShowSidePanelCommandMenuDropdown } from '@/command-menu-item/components/RecordShowSidePanelCommandMenuDropdown';
import { CommandMenuItemContextProvider } from '@/command-menu-item/contexts/CommandMenuItemContextProvider';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordShowSidePanelCommandMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <CommandMenuItemContextProvider
          isInSidePanel={true}
          displayType="dropdownItem"
          containerType="command-menu-show-page-dropdown"
        >
          <RecordShowSidePanelCommandMenuDropdown />
        </CommandMenuItemContextProvider>
      )}
    </>
  );
};
