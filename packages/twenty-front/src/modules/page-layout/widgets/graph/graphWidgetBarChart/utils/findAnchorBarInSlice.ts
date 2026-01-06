import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';

/**
 * Finds the anchor bar for tooltip positioning within a slice.
 * - Vertical layout: returns the topmost bar (smallest Y)
 * - Horizontal layout: returns the rightmost bar (largest X + width)
 */
export const findAnchorBarInSlice = (
  bars: ComputedBarDatum<BarDatum>[],
  isVerticalLayout: boolean,
): ComputedBarDatum<BarDatum> => {
  return isVerticalLayout
    ? bars.reduce((topBar, bar) => (bar.y < topBar.y ? bar : topBar))
    : bars.reduce((rightBar, bar) =>
        bar.x + bar.width > rightBar.x + rightBar.width ? bar : rightBar,
      );
};
