import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const RecordIndexCommandMenu = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataItemId && (
        <>
          <CommandMenuContextProvider
            isInSidePanel={false}
            displayType="button"
            containerType={CommandMenuItemContainerType.IndexPageHeader}
            isInPreviewMode={isLayoutCustomizationModeEnabled}
          >
            <PinnedCommandMenuItemButtons />
          </CommandMenuContextProvider>
          <CommandMenuContextProvider
            isInSidePanel={false}
            displayType="dropdownItem"
            containerType={CommandMenuItemContainerType.IndexPageDropdown}
          >
            <RecordIndexCommandMenuDropdown />
          </CommandMenuContextProvider>
          <CommandMenuItemEditButton />
        </>
      )}
    </>
  );
};
