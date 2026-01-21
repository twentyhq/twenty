import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { getBarChartAxisConfigs } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisConfigs';
import {
  getBarChartTickConfig,
  type BarChartTickConfig,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
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
import { type BarDatum } from '@nivo/bar';
import { BarChartLayout } from '~/generated/graphql';

export type GetBarChartLayoutParams = {
  axisTheme: ChartAxisTheme;
  fontFamily?: string;
  chartWidth: number;
  chartHeight: number;
  data: BarDatum[];
  indexBy: string;
  layout: BarChartLayout;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions: GraphValueFormatOptions;
  effectiveMinimumValue: number;
  effectiveMaximumValue: number;
};

export type BarChartLayoutResult = {
  margins: ChartMargins;
  axisBottomConfiguration: ReturnType<
    typeof getBarChartAxisConfigs
  >['axisBottom'];
  axisLeftConfiguration: ReturnType<typeof getBarChartAxisConfigs>['axisLeft'];
  valueTickValues: number[];
  valueDomain: { min: number; max: number };
};

const resolveAxisFontSizes = (axisTheme: ChartAxisTheme) => {
  const tickFontSize = parseFontSizeToPx(
    axisTheme.ticks.text.fontSize,
    BAR_CHART_CONSTANTS.AXIS_FONT_SIZE,
  );
  const legendFontSize = parseFontSizeToPx(
    axisTheme.legend.text.fontSize,
    tickFontSize,
  );

  return { tickFontSize, legendFontSize };
};

const resolveMarginInputs = ({
  tickConfiguration,
  tickResult,
  layout,
  formatOptions,
}: {
  tickConfiguration: BarChartTickConfig;
  tickResult: ReturnType<typeof computeValueTickValues>;
  layout: BarChartLayout;
  formatOptions: GraphValueFormatOptions;
}) => {
  const formatCategoryTick = (value: string | number, maxLength: number) =>
    truncateTickLabel(String(value), maxLength);
  const formatValueTick = (value: number, maxLength: number) =>
    truncateTickLabel(formatGraphValue(value, formatOptions), maxLength);

  const bottomTickLabels =
    layout === BarChartLayout.VERTICAL
      ? tickConfiguration.categoryTickValues.map((value) =>
          formatCategoryTick(
            value,
            tickConfiguration.maxBottomAxisTickLabelLength,
          ),
        )
      : tickResult.tickValues.map((value) =>
          formatValueTick(
            value,
            tickConfiguration.maxBottomAxisTickLabelLength,
          ),
        );

  const leftTickLabels =
    layout === BarChartLayout.VERTICAL
      ? tickResult.tickValues.map((value) =>
          formatValueTick(value, tickConfiguration.maxLeftAxisTickLabelLength),
        )
      : tickConfiguration.categoryTickValues.map((value) =>
          formatCategoryTick(
            value,
            tickConfiguration.maxLeftAxisTickLabelLength,
          ),
        );

  return { bottomTickLabels, leftTickLabels };
};

const resolveAxisBottomConfiguration = ({
  axisBottomConfigurationBase,
  margins,
  bottomLegendOffset,
}: {
  axisBottomConfigurationBase: ReturnType<
    typeof getBarChartAxisConfigs
  >['axisBottom'];
  margins: ChartMargins;
  bottomLegendOffset?: number;
}) => {
  const resolvedLegendOffset =
    bottomLegendOffset ?? axisBottomConfigurationBase.legendOffset;

  return {
    ...axisBottomConfigurationBase,
    legendOffset: Math.min(
      resolvedLegendOffset,
      Math.max(
        margins.bottom - COMMON_CHART_CONSTANTS.LEGEND_OFFSET_MARGIN_BUFFER,
        0,
      ),
    ),
  };
};

export const getBarChartLayout = ({
  axisTheme,
  fontFamily,
  chartWidth,
  chartHeight,
  data,
  indexBy,
  layout,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  effectiveMinimumValue,
  effectiveMaximumValue,
}: GetBarChartLayoutParams): BarChartLayoutResult => {
  const { tickFontSize, legendFontSize } = resolveAxisFontSizes(axisTheme);

  const {
    margins,
    tickConfiguration,
    valueTickResult,
    bottomLegendOffset,
  } = computeChartMargins({
    tickFontSize,
    legendFontSize,
    fontFamily,
    xAxisLabel,
    yAxisLabel,
    initialTickRotation: BAR_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    computeTickConfig: (currentMargins) =>
      getBarChartTickConfig({
        width: chartWidth,
        height: chartHeight,
        data,
        indexBy,
        axisFontSize: tickFontSize,
        layout,
        margins: currentMargins,
      }),
    computeValueTickValues: (currentTickConfiguration) =>
      computeValueTickValues({
        minimum: effectiveMinimumValue,
        maximum: effectiveMaximumValue,
        tickCount: currentTickConfiguration.numberOfValueTicks,
      }),
    getTickRotation: (currentTickConfiguration) =>
      currentTickConfiguration.bottomAxisTickRotation,
    getBottomLegendOffset: (parameters) =>
      computeBottomLegendOffsetFromText({
        tickLabels: parameters.marginInputs.bottomTickLabels,
        tickFontSize,
        fontFamily,
        tickRotation: parameters.tickConfiguration.bottomAxisTickRotation,
      }),
    resolveMarginInputs: (currentTickConfiguration, tickResult) =>
      resolveMarginInputs({
        tickConfiguration: currentTickConfiguration,
        tickResult,
        layout,
        formatOptions,
      }),
  });

  const { tickValues: valueTickValues, domain: valueDomain } = valueTickResult;

  const {
    axisBottom: axisBottomConfigurationBase,
    axisLeft: axisLeftConfiguration,
  } = getBarChartAxisConfigs({
    layout,
    xAxisLabel,
    yAxisLabel,
    formatOptions,
    valueTickValues,
    tickConfiguration,
    margins,
  });

  const axisBottomConfiguration = resolveAxisBottomConfiguration({
    axisBottomConfigurationBase,
    margins,
    bottomLegendOffset,
  });

  return {
    margins,
    axisBottomConfiguration,
    axisLeftConfiguration,
    valueTickValues,
    valueDomain,
  };
};
