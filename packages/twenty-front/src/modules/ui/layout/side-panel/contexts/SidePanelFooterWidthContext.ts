import { createContext } from 'react';

// Content width of the footer actions row, so an action that adapts to the
// available space can size itself without stretching over the row to measure.
export const SidePanelFooterWidthContext = createContext<number>(0);
