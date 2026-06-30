import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';

export const estimateLineHeight = (fontSize: number) =>
  Math.ceil(fontSize * COMMON_CHART_CONSTANTS.TICK_LABEL_LINE_HEIGHT_RATIO);
