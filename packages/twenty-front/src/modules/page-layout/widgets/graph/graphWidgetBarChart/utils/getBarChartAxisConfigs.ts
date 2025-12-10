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
import { NO_ROTATION_ANGLE } from '@/page-layout/widgets/graph/utils/noRotationAngle';
import { type BarDatum } from '@nivo/bar';

const LEFT_AXIS_LEGEND_OFFSET_PADDING = 5;
const TICK_PADDING = 5;
const BOTTOM_AXIS_LEGEND_OFFSET = 40;
const ROTATED_LABELS_EXTRA_BOTTOM_MARGIN = 20;
const TICK_SIZE = 0;
const DEFAULT_AXIS_FONT_SIZE = 11;

const COMMON_AXIS_CONFIG = {
  tickSize: TICK_SIZE,
  tickPadding: TICK_PADDING,
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
  axisFontSize = DEFAULT_AXIS_FONT_SIZE,
  valueTickValues,
  tickConfig,
}: GetBarChartAxisConfigsProps) => {
  const {
    categoryTickValues,
    numberOfValueTicks,
    maxBottomAxisTickLabelLength,
    maxLeftAxisTickLabelLength,
    bottomAxisTickRotation,
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

  const resolvedValueTickValues =
    valueTickValues && valueTickValues.length > 0
      ? valueTickValues
      : numberOfValueTicks;

  const baseMargins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });

  // Add extra bottom margin when labels are rotated (for vertical layout)
  const hasRotation = bottomAxisTickRotation !== 0;
  const margins =
    layout === BarChartLayout.VERTICAL && hasRotation
      ? {
          ...baseMargins,
          bottom: baseMargins.bottom + ROTATED_LABELS_EXTRA_BOTTOM_MARGIN,
        }
      : baseMargins;

  if (layout === BarChartLayout.VERTICAL) {
    return {
      axisBottom: {
        ...COMMON_AXIS_CONFIG,
        tickValues: categoryTickValues,
        tickRotation: bottomAxisTickRotation,
        legend: xAxisLabel,
        legendOffset:
          BOTTOM_AXIS_LEGEND_OFFSET +
          (hasRotation ? ROTATED_LABELS_EXTRA_BOTTOM_MARGIN : 0),
        format: (value: string | number) =>
          truncateTickLabel(String(value), maxBottomAxisTickLabelLength),
      },
      axisLeft: {
        ...COMMON_AXIS_CONFIG,
        tickRotation: NO_ROTATION_ANGLE,
        tickValues: resolvedValueTickValues,
        legend: yAxisLabel,
        legendOffset: -margins.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
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
      ...COMMON_AXIS_CONFIG,
      tickRotation: NO_ROTATION_ANGLE,
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
      tickRotation: NO_ROTATION_ANGLE,
      tickValues: categoryTickValues,
      legend: xAxisLabel,
      legendOffset: -margins.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
      format: (value: string | number) =>
        truncateTickLabel(String(value), maxLeftAxisTickLabelLength),
    },
    margins,
  };
};
