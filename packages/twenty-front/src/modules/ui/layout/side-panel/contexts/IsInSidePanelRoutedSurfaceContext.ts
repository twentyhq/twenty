import { createContext } from 'react';

// Separate from the surface's navigation context so that page chrome, which
// only needs the boolean, does not re-render when a navigation callback does.
export const IsInSidePanelRoutedSurfaceContext = createContext(false);
