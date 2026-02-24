import { PageHeaderActionMenuButtons } from '@/action-menu/components/PageHeaderActionMenuButtons';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordIndexActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isMobile = useIsMobile();

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <>
          <ActionMenuContextProvider
            isInRightDrawer={false}
            displayType="button"
            actionMenuType="index-page-action-menu"
          >
            {!isMobile && <PageHeaderActionMenuButtons />}
          </ActionMenuContextProvider>
          <ActionMenuContextProvider
            isInRightDrawer={false}
            displayType="dropdownItem"
            actionMenuType="index-page-action-menu-dropdown"
          >
            <RecordIndexActionMenuDropdown />
          </ActionMenuContextProvider>
        </>
      )}
    </>
  );
};
