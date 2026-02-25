import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordShowRightDrawerActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <ActionMenuContextProvider
          isInRightDrawer={true}
          displayType="dropdownItem"
          actionMenuType="command-menu-show-page-action-menu-dropdown"
        >
          <CommandMenuActionMenuDropdown />
        </ActionMenuContextProvider>
      )}
    </>
  );
};
