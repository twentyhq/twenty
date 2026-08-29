import { createContext } from 'react';

export type SidePanelRoutedSurfaceContextValue = {
  // A navigation raised inside a hosted route moves the panel when the target
  // is hostable, and escapes to the main outlet when it is not, so a link can
  // never dead-end on the right.
  navigateFromSidePanel: (path: string) => void;
};

export const SidePanelRoutedSurfaceContext =
  createContext<SidePanelRoutedSurfaceContextValue | null>(null);
