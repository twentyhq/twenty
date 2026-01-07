import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';

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
