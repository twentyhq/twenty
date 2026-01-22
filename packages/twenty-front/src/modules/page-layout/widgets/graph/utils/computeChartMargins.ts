import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { getChartMarginsFromText } from '@/page-layout/widgets/graph/utils/getChartMarginsFromText';

type ChartMarginInputs = {
  bottomTickLabels?: string[];
  leftTickLabels?: string[];
};

type ComputeChartMarginsParams<TTickConfig, TValueTickResult> = {
  tickFontSize: number;
  legendFontSize?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  initialTickRotation: number;
  computeTickConfig: (margins: ChartMargins) => TTickConfig;
  computeValueTickValues: (tickConfiguration: TTickConfig) => TValueTickResult;
  getTickRotation: (tickConfiguration: TTickConfig) => number;
  getBottomLegendOffset?: (params: {
    tickConfiguration: TTickConfig;
    marginInputs: ChartMarginInputs;
  }) => number;
  resolveMarginInputs: (
    tickConfiguration: TTickConfig,
    valueTickResult: TValueTickResult,
  ) => ChartMarginInputs;
};

type ComputeChartMarginsResult<TTickConfig, TValueTickResult> = {
  margins: ChartMargins;
  tickConfiguration: TTickConfig;
  valueTickResult: TValueTickResult;
  bottomLegendOffset?: number;
};

export const computeChartMargins = <TTickConfig, TValueTickResult>({
  tickFontSize,
  legendFontSize,
  xAxisLabel,
  yAxisLabel,
  initialTickRotation,
  computeTickConfig,
  computeValueTickValues,
  getTickRotation,
  getBottomLegendOffset,
  resolveMarginInputs,
}: ComputeChartMarginsParams<
  TTickConfig,
  TValueTickResult
>): ComputeChartMarginsResult<TTickConfig, TValueTickResult> => {
  const provisionalMargins = getChartMarginsFromText({
    tickFontSize,
    legendFontSize,
    xAxisLabel,
    yAxisLabel,
    tickRotation: initialTickRotation,
  });

  const provisionalTickConfiguration = computeTickConfig(provisionalMargins);
  const provisionalValueTickResult = computeValueTickValues(
    provisionalTickConfiguration,
  );
  const provisionalMarginInputs = resolveMarginInputs(
    provisionalTickConfiguration,
    provisionalValueTickResult,
  );

  const computedBottomLegendOffset = getBottomLegendOffset
    ? getBottomLegendOffset({
        tickConfiguration: provisionalTickConfiguration,
        marginInputs: provisionalMarginInputs,
      })
    : undefined;

  const computedMargins = getChartMarginsFromText({
    tickFontSize,
    legendFontSize,
    bottomTickLabels: provisionalMarginInputs.bottomTickLabels,
    leftTickLabels: provisionalMarginInputs.leftTickLabels,
    xAxisLabel,
    yAxisLabel,
    tickRotation: getTickRotation(provisionalTickConfiguration),
    bottomLegendOffset: computedBottomLegendOffset,
  });

  const tickConfiguration = computeTickConfig(computedMargins);
  const valueTickResult = computeValueTickValues(tickConfiguration);
  const marginInputs = resolveMarginInputs(tickConfiguration, valueTickResult);

  const bottomLegendOffset = getBottomLegendOffset
    ? getBottomLegendOffset({
        tickConfiguration,
        marginInputs,
      })
    : undefined;

  const margins = getChartMarginsFromText({
    tickFontSize,
    legendFontSize,
    bottomTickLabels: marginInputs.bottomTickLabels,
    leftTickLabels: marginInputs.leftTickLabels,
    xAxisLabel,
    yAxisLabel,
    tickRotation: getTickRotation(tickConfiguration),
    bottomLegendOffset,
  });

  return { margins, tickConfiguration, valueTickResult, bottomLegendOffset };
};
