import { type ComputedBarDatum } from '@nivo/bar';
import { type BarChartDataItem } from '../types/BarChartDataItem';

export const calculateBarEndLineCoordinates = (
  bar: ComputedBarDatum<BarChartDataItem>,
  layout: 'vertical' | 'horizontal',
) => {
  if (layout === 'vertical') {
    return {
      x1: bar.x,
      x2: bar.x + bar.width,
      y1: bar.y,
      y2: bar.y,
    };
  } else {
    return {
      x1: bar.x + bar.width,
      x2: bar.x + bar.width,
      y1: bar.y,
      y2: bar.y + bar.height,
    };
  }
};
