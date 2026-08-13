import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordPageSidePanelCommandMenuDropdown } from '@/command-menu-item/components/RecordPageSidePanelCommandMenuDropdown';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordPageSidePanelCommandMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <CommandMenuContextProvider
          isInSidePanel={true}
          displayType="dropdownItem"
          containerType={
            CommandMenuItemContainerType.CommandMenuShowPageDropdown
          }
        >
          <RecordPageSidePanelCommandMenuDropdown />
        </CommandMenuContextProvider>
      )}
    </>
  );
};
