import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

type LineChartAxisLeftConfigParams = {
  yAxisLabel?: string;
  formatOptions?: GraphValueFormatOptions;
  tickValues?: number[];
  marginLeft: number;
};

export const getLineChartAxisLeftConfig = ({
  yAxisLabel,
  formatOptions,
  tickValues,
  marginLeft,
}: LineChartAxisLeftConfigParams) => {
  return {
    tickSize: COMMON_CHART_CONSTANTS.TICK_SIZE,
    tickPadding: COMMON_CHART_CONSTANTS.TICK_PADDING,
    tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    tickValues,
    legend: yAxisLabel,
    legendPosition: 'middle' as const,
    legendOffset:
      -marginLeft + COMMON_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING,
    format: (value: number) => formatGraphValue(value, formatOptions || {}),
  };
};
