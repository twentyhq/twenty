import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { isDefined } from 'twenty-shared/utils';

import { SIDE_PANEL_FOOTER_OPTIONS_RESERVED_WIDTH } from '@/command-menu-item/constants/SidePanelFooterOptionsReservedWidth';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { SidePanelFooterWidthContext } from '@/ui/layout/side-panel/contexts/SidePanelFooterWidthContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';

export const RecordPageSidePanelPinnedCommandMenuItems = () => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const sidePanelFooterWidth = useContext(SidePanelFooterWidthContext);

  if (!isDefined(contextStoreCurrentObjectMetadataItemId)) {
    return null;
  }

  // The options dropdown shares the footer row, so its footprint is reserved
  // out of the width the pinned buttons may occupy.
  const availableWidth = Math.max(
    sidePanelFooterWidth - SIDE_PANEL_FOOTER_OPTIONS_RESERVED_WIDTH,
    0,
  );

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
