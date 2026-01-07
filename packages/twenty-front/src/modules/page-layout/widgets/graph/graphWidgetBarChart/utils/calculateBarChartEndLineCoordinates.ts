import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { BarChartLayout } from '~/generated/graphql';

export const calculateBarChartEndLineCoordinates = (
  bar: ComputedBarDatum<BarDatum>,
  layout: BarChartLayout,
) => {
  if (layout === BarChartLayout.VERTICAL) {
    return {
      x1: bar.x,
      x2: bar.x + bar.width,
      y1: bar.y,
      y2: bar.y,
    };
  }
  return {
    x1: bar.x + bar.width,
    x2: bar.x + bar.width,
    y1: bar.y,
    y2: bar.y + bar.height,
  };
};
