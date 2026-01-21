import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeriesWithColor';
import { getLineChartAxisBottomConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisBottomConfig';
import { getLineChartAxisLeftConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisLeftConfig';
import { type ChartAxisTheme } from '@/page-layout/widgets/graph/types/ChartAxisTheme';
import { computeChartMargins } from '@/page-layout/widgets/graph/utils/computeChartMargins';
import { computeValueTickValues } from '@/page-layout/widgets/graph/utils/computeValueTickValues';
import {
  computeBottomLegendOffsetFromText,
  type ChartMargins,
} from '@/page-layout/widgets/graph/utils/getChartMarginsFromText';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { parseFontSizeToPx } from '@/page-layout/widgets/graph/utils/parseFontSize';

export type GetLineChartLayoutParams = {
  axisTheme: ChartAxisTheme;
  fontFamily?: string;
  chartWidth: number;
  data: LineChartSeriesWithColor[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions: GraphValueFormatOptions;
  effectiveMinimumValue: number;
  effectiveMaximumValue: number;
};

export type LineChartLayout = {
  margins: ChartMargins;
  axisBottomConfiguration: ReturnType<
    typeof getLineChartAxisBottomConfig
  >['config'];
  axisLeftConfiguration: ReturnType<typeof getLineChartAxisLeftConfig>;
  valueTickValues: number[];
  valueDomain: { min: number; max: number };
};

const resolveAxisFontSizes = (axisTheme: ChartAxisTheme) => {
  const tickFontSize = parseFontSizeToPx(
    axisTheme.ticks.text.fontSize,
    LINE_CHART_CONSTANTS.AXIS_FONT_SIZE,
  );
  const legendFontSize = parseFontSizeToPx(
    axisTheme.legend.text.fontSize,
    tickFontSize,
  );

  return { tickFontSize, legendFontSize };
};

const resolveAxisBottomConfiguration = ({
  axisBottomConfigurationResult,
  margins,
  bottomLegendOffset,
}: {
  axisBottomConfigurationResult: ReturnType<
    typeof getLineChartAxisBottomConfig
  >;
  margins: ChartMargins;
  bottomLegendOffset?: number;
}) => {
  const resolvedLegendOffset =
    bottomLegendOffset ?? axisBottomConfigurationResult.config.legendOffset;

  return {
    ...axisBottomConfigurationResult.config,
    legendOffset: Math.min(
      resolvedLegendOffset,
      Math.max(
        margins.bottom - COMMON_CHART_CONSTANTS.LEGEND_OFFSET_MARGIN_BUFFER,
        0,
      ),
    ),
  };
};

export const getLineChartLayout = ({
  axisTheme,
  fontFamily,
  chartWidth,
  data,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  effectiveMinimumValue,
  effectiveMaximumValue,
}: GetLineChartLayoutParams): LineChartLayout => {
  const { tickFontSize, legendFontSize } = resolveAxisFontSizes(axisTheme);

  const {
    margins,
    tickConfiguration: axisBottomConfigurationResult,
    valueTickResult,
    bottomLegendOffset,
  } = computeChartMargins({
    tickFontSize,
    legendFontSize,
    fontFamily,
    xAxisLabel,
    yAxisLabel,
    initialTickRotation: LINE_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    computeTickConfig: (currentMargins) =>
      getLineChartAxisBottomConfig(
        xAxisLabel,
        chartWidth,
        data,
        currentMargins.left,
        currentMargins.right,
        tickFontSize,
      ),
    computeValueTickValues: () =>
      computeValueTickValues({
        minimum: effectiveMinimumValue,
        maximum: effectiveMaximumValue,
        tickCount: LINE_CHART_CONSTANTS.DEFAULT_TICK_COUNT,
      }),
    getTickRotation: (tickConfiguration) =>
      tickConfiguration.config.tickRotation,
    getBottomLegendOffset: (parameters) =>
      computeBottomLegendOffsetFromText({
        tickLabels: parameters.marginInputs.bottomTickLabels,
        tickFontSize,
        fontFamily,
        tickRotation: parameters.tickConfiguration.config.tickRotation,
      }),
    resolveMarginInputs: (tickConfiguration, tickResult) => ({
      bottomTickLabels: (tickConfiguration.config.tickValues ?? []).map(
        (value) => tickConfiguration.config.format(value),
      ),
      leftTickLabels: tickResult.tickValues.map((value) =>
        formatGraphValue(value, formatOptions),
      ),
    }),
  });

  const axisBottomConfiguration = resolveAxisBottomConfiguration({
    axisBottomConfigurationResult,
    margins,
    bottomLegendOffset,
  });

  const { tickValues: valueTickValues, domain: valueDomain } = valueTickResult;

  const axisLeftConfiguration = getLineChartAxisLeftConfig(
    yAxisLabel,
    formatOptions,
    valueTickValues,
    margins.left,
  );

  return {
    margins,
    axisBottomConfiguration,
    axisLeftConfiguration,
    valueTickValues,
    valueDomain,
  };
};
