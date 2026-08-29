import { useContext } from 'react';

import { SidePanelRoutedSurfaceContext } from '@/side-panel/routing/contexts/SidePanelRoutedSurfaceContext';

export const useSidePanelRoutedSurface = () =>
  useContext(SidePanelRoutedSurfaceContext);
