import { createContext } from 'react';

export type SidePanelRoutedSurfaceContextValue = {
  // A navigation raised inside a hosted route moves the panel when the target
  // is hostable, and escapes to the main outlet when it is not, so a link can
  // never dead-end on the right.
  //
  // Only the imperative hooks route through this. A react-router Link renders
  // an anchor bound to the browser router, which the panel's Routes overrides
  // the location of but not the navigator, so a Link to a hostable target
  // still moves the main outlet. Intercepting anchor clicks at this boundary
  // would double-open the rows that pair a Link with a panel-aware onClick,
  // so closing the gap properly means giving the panel its own router.
  navigateFromSidePanel: (path: string) => void;
  // Returning from a hosted page pops the panel's own stack. Browser history
  // belongs to the main outlet, and the panel path sync would rewrite a
  // memorized URL back to whatever the panel is currently showing.
  goBackFromSidePanel: () => void;
};

export const SidePanelRoutedSurfaceContext =
  createContext<SidePanelRoutedSurfaceContextValue | null>(null);
