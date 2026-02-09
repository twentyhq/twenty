import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { isNumber } from '@sniptt/guards';

export const hasNegativeValuesInData = (
  data: BarChartDatum[],
  keys: string[],
): boolean => {
  for (const datum of data) {
    for (const key of keys) {
      const value = datum[key];
      if (isNumber(value) && value < 0) {
        return true;
      }
    }
  }
  return false;
};
