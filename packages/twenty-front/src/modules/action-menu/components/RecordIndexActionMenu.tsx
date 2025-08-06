import { PageHeaderActionMenuButtons } from '@/action-menu/components/PageHeaderActionMenuButtons';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordIndexActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
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
