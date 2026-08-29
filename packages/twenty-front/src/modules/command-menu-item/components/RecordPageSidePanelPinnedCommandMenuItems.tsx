import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { useSidePanelFooterPinnedItemsAvailableWidth } from '@/command-menu-item/hooks/useSidePanelFooterPinnedItemsAvailableWidth';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const RecordPageSidePanelPinnedCommandMenuItems = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const sidePanelWidgetFooterCommandMenuItems = useAtomStateValue(
    sidePanelWidgetFooterCommandMenuItemsState,
  );

  const availableWidth = useSidePanelFooterPinnedItemsAvailableWidth();

  // A widget that contributes footer actions, such as the email composer,
  // supersedes the record's own actions rather than doubling up with them.
  const hasPinnedWidgetCommandMenuItems =
    sidePanelWidgetFooterCommandMenuItems.some(
      (commandMenuItem) => commandMenuItem.isPinned !== false,
    );

  if (
    !isDefined(contextStoreCurrentObjectMetadataItemId) ||
    hasPinnedWidgetCommandMenuItems
  ) {
    return null;
  }

  return (
    <CommandMenuContextProvider
      isInSidePanel={true}
      displayType="button"
      containerType={CommandMenuItemContainerType.SidePanelFooter}
    >
      <PinnedCommandMenuItemButtons containerWidth={availableWidth} />
    </CommandMenuContextProvider>
  );
};
