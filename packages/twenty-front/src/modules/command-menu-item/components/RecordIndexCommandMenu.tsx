import { PageHeaderCommandMenuButtons } from '@/command-menu-item/components/PageHeaderCommandMenuButtons';
import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
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
          <CommandMenuContextProvider
            isInSidePanel={false}
            displayType="button"
            containerType="index-page-header"
          >
            {!isMobile && <PageHeaderCommandMenuButtons />}
          </CommandMenuContextProvider>
          <CommandMenuContextProvider
            isInSidePanel={false}
            displayType="dropdownItem"
            containerType="index-page-dropdown"
          >
            <RecordIndexCommandMenuDropdown />
          </CommandMenuContextProvider>
        </>
      )}
    </>
  );
};
