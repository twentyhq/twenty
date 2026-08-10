import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordPageSidePanelPinnedCommandMenuItems = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  if (!contextStoreCurrentObjectMetadataItemId) {
    return null;
  }

  return (
    <CommandMenuContextProvider
      isInSidePanel={true}
      displayType="button"
      containerType="side-panel-footer"
    >
      <PinnedCommandMenuItemButtons />
    </CommandMenuContextProvider>
  );
};
