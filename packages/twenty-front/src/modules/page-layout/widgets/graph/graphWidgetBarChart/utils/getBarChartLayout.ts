import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { getBarChartAxisConfigs } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisConfigs';
import {
  getBarChartTickConfig,
  type BarChartTickConfig,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { type ChartAxisTheme } from '@/page-layout/widgets/graph/types/ChartAxisTheme';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { computeBottomLegendOffsetFromText } from '@/page-layout/widgets/graph/utils/computeBottomLegendOffsetFromText';
import { computeChartMargins } from '@/page-layout/widgets/graph/utils/computeChartMargins';
import { computeValueTickValues } from '@/page-layout/widgets/graph/utils/computeValueTickValues';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { resolveAxisFontSizes } from '@/page-layout/widgets/graph/utils/resolveAxisFontSizes';
import { BarChartLayout } from '~/generated-metadata/graphql';

type GetBarChartLayoutParams = {
  axisTheme: ChartAxisTheme;
  chartWidth: number;
  chartHeight: number;
  data: BarChartDatum[];
  indexBy: string;
  layout: BarChartLayout;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions: GraphValueFormatOptions;
  effectiveMinimumValue: number;
  effectiveMaximumValue: number;
};

type BarChartLayoutResult = {
  margins: ChartMargins;
  axisBottomConfiguration: ReturnType<
    typeof getBarChartAxisConfigs
  >['axisBottom'];
  axisLeftConfiguration: ReturnType<typeof getBarChartAxisConfigs>['axisLeft'];
  valueTickValues: number[];
  valueDomain: { min: number; max: number };
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
          formatGraphValue(value, formatOptions),
        )
      : tickConfiguration.categoryTickValues.map((value) =>
          truncateTickLabel(
            String(value),
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

  const { margins, tickConfiguration, valueTickResult, bottomLegendOffset } =
    computeChartMargins({
      tickFontSize,
      legendFontSize,
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
