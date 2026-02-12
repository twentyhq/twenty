import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartTickConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { BarChartLayout } from '~/generated-metadata/graphql';

type GetBarChartAxisConfigsProps = {
  layout: BarChartLayout;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions?: GraphValueFormatOptions;
  valueTickValues?: number[];
  tickConfiguration: BarChartTickConfig;
  margins: ChartMargins;
};

export const getBarChartAxisConfigs = ({
  layout,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  valueTickValues,
  tickConfiguration,
  margins,
}: GetBarChartAxisConfigsProps) => {
  const {
    categoryTickValues,
    numberOfValueTicks,
    maxBottomAxisTickLabelLength,
    maxLeftAxisTickLabelLength,
    bottomAxisTickRotation,
  } = tickConfiguration;

  const resolvedValueTickValues =
    valueTickValues && valueTickValues.length > 0
      ? valueTickValues
      : numberOfValueTicks;

  const hasRotation = bottomAxisTickRotation !== 0;
  const baseBottomLegendOffset =
    BAR_CHART_CONSTANTS.BOTTOM_AXIS_LEGEND_OFFSET +
    (hasRotation ? BAR_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN : 0);
  const bottomLegendOffset = Math.min(
    baseBottomLegendOffset,
    Math.max(
      margins.bottom - COMMON_CHART_CONSTANTS.LEGEND_OFFSET_MARGIN_BUFFER,
      0,
    ),
  );

  if (layout === BarChartLayout.VERTICAL) {
    return {
      axisBottom: {
        tickSize: BAR_CHART_CONSTANTS.TICK_SIZE,
        tickPadding: BAR_CHART_CONSTANTS.TICK_PADDING,
        legendPosition: 'middle' as const,
        tickValues: categoryTickValues,
        tickRotation: bottomAxisTickRotation,
        legend: xAxisLabel,
        legendOffset: bottomLegendOffset,
        format: (value: string | number) =>
          truncateTickLabel(String(value), maxBottomAxisTickLabelLength),
      },
      axisLeft: {
        tickSize: BAR_CHART_CONSTANTS.TICK_SIZE,
        tickPadding: BAR_CHART_CONSTANTS.TICK_PADDING,
        legendPosition: 'middle' as const,
        tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
        tickValues: resolvedValueTickValues,
        legend: yAxisLabel,
        legendOffset:
          -margins.left + BAR_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING,
        format: (value: string | number) =>
          truncateTickLabel(
            formatGraphValue(Number(value), formatOptions ?? {}),
            maxLeftAxisTickLabelLength,
          ),
      },
      margins,
    };
  }

  return {
    axisBottom: {
      tickSize: BAR_CHART_CONSTANTS.TICK_SIZE,
      tickPadding: BAR_CHART_CONSTANTS.TICK_PADDING,
      legendPosition: 'middle' as const,
      tickRotation: BAR_CHART_CONSTANTS.NO_ROTATION_ANGLE,
      tickValues: resolvedValueTickValues,
      legend: xAxisLabel,
      legendOffset: Math.min(
        BAR_CHART_CONSTANTS.BOTTOM_AXIS_LEGEND_OFFSET,
        Math.max(
          margins.bottom - COMMON_CHART_CONSTANTS.LEGEND_OFFSET_MARGIN_BUFFER,
          0,
        ),
      ),
      format: (value: string | number) =>
        truncateTickLabel(
          formatGraphValue(Number(value), formatOptions ?? {}),
          maxBottomAxisTickLabelLength,
        ),
    },
    axisLeft: {
      tickSize: COMMON_CHART_CONSTANTS.TICK_SIZE,
      tickPadding: COMMON_CHART_CONSTANTS.TICK_PADDING,
      legendPosition: 'middle' as const,
      tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
      tickValues: categoryTickValues,
      legend: yAxisLabel,
      legendOffset:
        -margins.left + BAR_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING,
      format: (value: string | number) =>
        truncateTickLabel(String(value), maxLeftAxisTickLabelLength),
    },
    margins,
  };
};
