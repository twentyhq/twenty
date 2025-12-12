import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type GraphColorScheme } from '@/page-layout/widgets/graph/types/GraphColorScheme';

export const createAreaFillDef = (
  colorScheme: GraphColorScheme,
  id: string,
) => {
  return {
    id,
    type: 'linearGradient' as const,
    x1: '0%',
    y1: '0%',
    x2: '0%',
    y2: '100%',
    colors: [
      {
        offset: 0,
        color: colorScheme.solid,
        opacity: LINE_CHART_CONSTANTS.AREA_FILL_START_OPACITY,
      },
      {
        offset: 100,
        color: colorScheme.solid,
        opacity: LINE_CHART_CONSTANTS.AREA_FILL_END_OPACITY,
      },
    ],
  };
};
