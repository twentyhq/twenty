import { useEffect } from 'react';

import {
  SIDE_PANEL_WIDTH_VAR,
  sidePanelWidthState,
} from '@/side-panel/states/sidePanelWidthState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SidePanelWidthEffect = () => {
  const sidePanelWidth = useAtomStateValue(sidePanelWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      SIDE_PANEL_WIDTH_VAR,
      `${sidePanelWidth}px`,
    );
  }, [sidePanelWidth]);

  return null;
};
