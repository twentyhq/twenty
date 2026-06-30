import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { type ChartAxisTheme } from '@/page-layout/widgets/graph/types/ChartAxisTheme';

export const resolveAxisFontSizes = (axisTheme: ChartAxisTheme) => {
  const tickFontSize =
    axisTheme?.ticks?.text?.fontSize ?? COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE;
  const legendFontSize = axisTheme?.legend?.text?.fontSize ?? tickFontSize;

  return { tickFontSize, legendFontSize };
};
