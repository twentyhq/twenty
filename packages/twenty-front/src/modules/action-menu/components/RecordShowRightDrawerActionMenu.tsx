import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordShowRightDrawerActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
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
