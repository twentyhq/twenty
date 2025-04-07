import { PageHeaderActionMenuButtons } from '@/action-menu/components/PageHeaderActionMenuButtons';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordIndexActionMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const isMobile = useIsMobile();

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <>
          <ActionMenuContext.Provider
            value={{
              isInRightDrawer: false,
              displayType: 'button',
              actionMenuType: 'index-page-action-menu',
            }}
          >
            {!isMobile && <PageHeaderActionMenuButtons />}
          </ActionMenuContext.Provider>
          <ActionMenuContext.Provider
            value={{
              isInRightDrawer: false,
              displayType: 'dropdownItem',
              actionMenuType: 'index-page-action-menu-dropdown',
            }}
          >
            <RecordIndexActionMenuDropdown />
          </ActionMenuContext.Provider>
        </>
      )}
    </>
  );
};
