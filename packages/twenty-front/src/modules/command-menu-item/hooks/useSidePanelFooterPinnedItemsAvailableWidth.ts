import { SIDE_PANEL_FOOTER_OPTIONS_RESERVED_WIDTH } from '@/command-menu-item/constants/SidePanelFooterOptionsReservedWidth';
import { SidePanelFooterWidthContext } from '@/ui/layout/side-panel/contexts/SidePanelFooterWidthContext';
import { useContext } from 'react';

// Width left for the pinned buttons once the options dropdown footprint is
// reserved out of the measured footer row. The buttons and the overflow
// dropdown both size against this so they can never disagree on what fits.
export const useSidePanelFooterPinnedItemsAvailableWidth = () => {
  const sidePanelFooterWidth = useContext(SidePanelFooterWidthContext);

  return Math.max(
    sidePanelFooterWidth - SIDE_PANEL_FOOTER_OPTIONS_RESERVED_WIDTH,
    0,
  );
};
