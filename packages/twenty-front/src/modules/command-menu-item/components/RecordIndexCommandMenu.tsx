import { PageHeaderCommandMenuButtons } from '@/command-menu-item/components/PageHeaderCommandMenuButtons';
import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { CommandMenuItemContextProvider } from '@/command-menu-item/contexts/CommandMenuItemContextProvider';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordIndexCommandMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isMobile = useIsMobile();

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <>
          <CommandMenuItemContextProvider
            isInSidePanel={false}
            displayType="button"
            actionMenuType="index-page-action-menu"
          >
            {!isMobile && <PageHeaderCommandMenuButtons />}
          </CommandMenuItemContextProvider>
          <CommandMenuItemContextProvider
            isInSidePanel={false}
            displayType="dropdownItem"
            actionMenuType="index-page-action-menu-dropdown"
          >
            <RecordIndexCommandMenuDropdown />
          </CommandMenuItemContextProvider>
        </>
      )}
    </>
  );
};
