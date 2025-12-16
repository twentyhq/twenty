import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { isDefined } from 'twenty-shared/utils';

export const getLineChartAxisLeftConfig = (
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
  tickValues?: number[],
  marginLeft?: number,
) => {
  const effectiveMarginLeft =
    marginLeft ??
    (isDefined(yAxisLabel)
      ? COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITH_LABEL
      : COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITHOUT_LABEL);

  return {
    tickSize: COMMON_CHART_CONSTANTS.TICK_SIZE,
    tickPadding: COMMON_CHART_CONSTANTS.TICK_PADDING,
    tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    tickValues,
    legend: yAxisLabel,
    legendPosition: 'middle' as const,
    legendOffset:
      -effectiveMarginLeft +
      COMMON_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING,
    format: (value: number) => formatGraphValue(value, formatOptions || {}),
  };
};
