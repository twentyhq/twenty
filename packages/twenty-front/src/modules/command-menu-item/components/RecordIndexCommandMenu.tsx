import { PinnedCommandMenuItemButtons } from '@/command-menu-item/server-items/display/components/PinnedCommandMenuItemButtons';
import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemEditButton } from '@/command-menu-item/server-items/edit/components/CommandMenuItemEditButton';
import { PinnedCommandMenuItemButtonsEditMode } from '@/command-menu-item/server-items/edit/components/PinnedCommandMenuItemButtonsEditMode';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordIndexCommandMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isMobile = useIsMobile();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const showEditModePinnedButtons = isLayoutCustomizationModeEnabled;

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <>
          {!isMobile && showEditModePinnedButtons ? (
            <PinnedCommandMenuItemButtonsEditMode />
          ) : (
            <CommandMenuContextProvider
              isInSidePanel={false}
              displayType="button"
              containerType="index-page-header"
            >
              {!isMobile && <PinnedCommandMenuItemButtons />}
            </CommandMenuContextProvider>
          )}
          <CommandMenuContextProvider
            isInSidePanel={false}
            displayType="dropdownItem"
            containerType="index-page-dropdown"
          >
            <RecordIndexCommandMenuDropdown />
          </CommandMenuContextProvider>
          <CommandMenuItemEditButton />
        </>
      )}
    </>
  );
};
