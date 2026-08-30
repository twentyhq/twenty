import { useContext } from 'react';

import { IsInSidePanelRoutedSurfaceContext } from '@/ui/layout/side-panel/contexts/IsInSidePanelRoutedSurfaceContext';

export const useIsInSidePanelRoutedSurface = () =>
  useContext(IsInSidePanelRoutedSurfaceContext);
