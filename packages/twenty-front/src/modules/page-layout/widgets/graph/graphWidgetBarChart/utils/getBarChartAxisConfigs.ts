import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import {
  type BarChartTickConfig,
  getBarChartTickConfig,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type BarDatum } from '@nivo/bar';

const LEFT_AXIS_LEGEND_OFFSET_PADDING = 5;
const TICK_PADDING = 5;
const BOTTOM_AXIS_LEGEND_OFFSET = 40;

const COMMON_AXIS_CONFIG = {
  tickSize: 0,
  tickPadding: TICK_PADDING,
  tickRotation: 0,
  legendPosition: 'middle' as const,
};

type GetBarChartAxisConfigsProps = {
  width: number;
  height: number;
  data: BarDatum[];
  layout: BarChartLayout;
  indexBy: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions?: GraphValueFormatOptions;
  axisFontSize?: number;
  valueTickValues?: number[];
  tickConfig?: BarChartTickConfig;
};

export const getBarChartAxisConfigs = ({
  width,
  height,
  data,
  layout,
  indexBy,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  axisFontSize = 11,
  valueTickValues,
  tickConfig,
}: GetBarChartAxisConfigsProps) => {
  const {
    categoryTickValues,
    numberOfValueTicks,
    maxBottomAxisTickLabelLength,
    maxLeftAxisTickLabelLength,
  } =
    tickConfig ??
    getBarChartTickConfig({
      width,
      height,
      data,
      indexBy,
      xAxisLabel,
      yAxisLabel,
      axisFontSize,
      layout,
    });

  const margins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });
  const resolvedValueTickValues =
    valueTickValues && valueTickValues.length > 0
      ? valueTickValues
      : numberOfValueTicks;

  if (layout === BarChartLayout.VERTICAL) {
    return {
      axisBottom: {
        ...COMMON_AXIS_CONFIG,
        tickValues: categoryTickValues,
        legend: xAxisLabel,
        legendOffset: BOTTOM_AXIS_LEGEND_OFFSET,
        format: (value: string | number) =>
          truncateTickLabel(String(value), maxBottomAxisTickLabelLength),
      },
      axisLeft: {
        ...COMMON_AXIS_CONFIG,
        tickValues: resolvedValueTickValues,
        legend: yAxisLabel,
        legendOffset: -margins.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
        format: (value: number) =>
          truncateTickLabel(
            formatGraphValue(value, formatOptions ?? {}),
            maxLeftAxisTickLabelLength,
          ),
      },
    };
  }

  return {
    axisBottom: {
      ...COMMON_AXIS_CONFIG,
      tickValues: resolvedValueTickValues,
      legend: yAxisLabel,
      legendOffset: BOTTOM_AXIS_LEGEND_OFFSET,
      format: (value: number) =>
        truncateTickLabel(
          formatGraphValue(value, formatOptions ?? {}),
          maxBottomAxisTickLabelLength,
        ),
    },
    axisLeft: {
      ...COMMON_AXIS_CONFIG,
      tickValues: categoryTickValues,
      legend: xAxisLabel,
      legendOffset: -margins.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
      format: (value: string | number) =>
        truncateTickLabel(String(value), maxLeftAxisTickLabelLength),
    },
  };
};
