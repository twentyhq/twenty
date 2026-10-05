import { createContext } from 'react';

// Lets an action adapt to the footer row width without stretching over the row to measure it
export const SidePanelFooterWidthContext = createContext<number>(0);
