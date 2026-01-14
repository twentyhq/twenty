import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartTickConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { BarChartLayout } from '~/generated/graphql';

type GetBarChartAxisConfigsProps = {
  layout: BarChartLayout;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions?: GraphValueFormatOptions;
  valueTickValues?: number[];
  tickConfig: BarChartTickConfig;
};

export const getBarChartAxisConfigs = ({
  layout,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  valueTickValues,
  tickConfig,
}: GetBarChartAxisConfigsProps) => {
  const {
    categoryTickValues,
    numberOfValueTicks,
    maxBottomAxisTickLabelLength,
    maxLeftAxisTickLabelLength,
    bottomAxisTickRotation,
  } = tickConfig;

  const resolvedValueTickValues =
    valueTickValues && valueTickValues.length > 0
      ? valueTickValues
      : numberOfValueTicks;

  const baseMargins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });

  const hasRotation = bottomAxisTickRotation !== 0;
  const margins =
    layout === BarChartLayout.VERTICAL && hasRotation
      ? {
          ...baseMargins,
          bottom:
            baseMargins.bottom +
            COMMON_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN,
        }
      : baseMargins;

  if (layout === BarChartLayout.VERTICAL) {
    return {
      axisBottom: {
        tickSize: BAR_CHART_CONSTANTS.TICK_SIZE,
        tickPadding: BAR_CHART_CONSTANTS.TICK_PADDING,
        legendPosition: 'middle' as const,
        tickValues: categoryTickValues,
        tickRotation: bottomAxisTickRotation,
        legend: xAxisLabel,
        legendOffset:
          BAR_CHART_CONSTANTS.BOTTOM_AXIS_LEGEND_OFFSET +
          (hasRotation
            ? BAR_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN
            : 0),
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
        format: (value: number) =>
          truncateTickLabel(
            formatGraphValue(value, formatOptions ?? {}),
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
      legend: yAxisLabel,
      legendOffset: BAR_CHART_CONSTANTS.BOTTOM_AXIS_LEGEND_OFFSET,
      format: (value: number) =>
        truncateTickLabel(
          formatGraphValue(value, formatOptions ?? {}),
          maxBottomAxisTickLabelLength,
        ),
    },
    axisLeft: {
      tickSize: COMMON_CHART_CONSTANTS.TICK_SIZE,
      tickPadding: COMMON_CHART_CONSTANTS.TICK_PADDING,
      legendPosition: 'middle' as const,
      tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
      tickValues: categoryTickValues,
      legend: xAxisLabel,
      legendOffset:
        -margins.left + BAR_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING,
      format: (value: string | number) =>
        truncateTickLabel(String(value), maxLeftAxisTickLabelLength),
    },
    margins,
  };
};
