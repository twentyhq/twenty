import { SIDE_PANEL_FOOTER_OPTIONS_RESERVED_WIDTH } from '@/command-menu-item/constants/SidePanelFooterOptionsReservedWidth';
import { SidePanelFooterWidthContext } from '@/ui/layout/side-panel/contexts/SidePanelFooterWidthContext';
import { useContext } from 'react';

// Shared by the buttons and the overflow dropdown so they never disagree on what fits.
export const useSidePanelFooterPinnedItemsAvailableWidth = () => {
  const sidePanelFooterWidth = useContext(SidePanelFooterWidthContext);

  return Math.max(
    sidePanelFooterWidth - SIDE_PANEL_FOOTER_OPTIONS_RESERVED_WIDTH,
    0,
  );
};
