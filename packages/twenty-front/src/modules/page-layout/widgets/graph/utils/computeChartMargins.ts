import {
  getChartMarginsFromText,
  type ChartMargins,
} from '@/page-layout/widgets/graph/utils/getChartMarginsFromText';

export type ChartMarginInputs = {
  bottomTickLabels?: string[];
  leftTickLabels?: string[];
};

export type ComputeChartMarginsParams<TTickConfig, TValueTickResult> = {
  tickFontSize: number | string;
  legendFontSize?: number | string;
  fontFamily?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  initialTickRotation: number;
  computeTickConfig: (margins: ChartMargins) => TTickConfig;
  computeValueTickValues: (tickConfig: TTickConfig) => TValueTickResult;
  getTickRotation: (tickConfig: TTickConfig) => number;
  getBottomLegendOffset?: (params: {
    tickConfig: TTickConfig;
    marginInputs: ChartMarginInputs;
  }) => number;
  resolveMarginInputs: (
    tickConfig: TTickConfig,
    valueTickResult: TValueTickResult,
  ) => ChartMarginInputs;
};

export type ComputeChartMarginsResult<TTickConfig, TValueTickResult> = {
  margins: ChartMargins;
  tickConfig: TTickConfig;
  valueTickResult: TValueTickResult;
  bottomLegendOffset?: number;
};

export const computeChartMargins = <TTickConfig, TValueTickResult>({
  tickFontSize,
  legendFontSize,
  fontFamily,
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
    fontFamily,
    xAxisLabel,
    yAxisLabel,
    tickRotation: initialTickRotation,
  });

  const provisionalTickConfig = computeTickConfig(provisionalMargins);
  const provisionalValueTickResult = computeValueTickValues(
    provisionalTickConfig,
  );
  const provisionalMarginInputs = resolveMarginInputs(
    provisionalTickConfig,
    provisionalValueTickResult,
  );

  const computedBottomLegendOffset = getBottomLegendOffset
    ? getBottomLegendOffset({
        tickConfig: provisionalTickConfig,
        marginInputs: provisionalMarginInputs,
      })
    : undefined;

  const computedMargins = getChartMarginsFromText({
    tickFontSize,
    legendFontSize,
    fontFamily,
    bottomTickLabels: provisionalMarginInputs.bottomTickLabels,
    leftTickLabels: provisionalMarginInputs.leftTickLabels,
    xAxisLabel,
    yAxisLabel,
    tickRotation: getTickRotation(provisionalTickConfig),
    bottomLegendOffset: computedBottomLegendOffset,
  });

  const tickConfig = computeTickConfig(computedMargins);
  const valueTickResult = computeValueTickValues(tickConfig);
  const marginInputs = resolveMarginInputs(tickConfig, valueTickResult);

  const bottomLegendOffset = getBottomLegendOffset
    ? getBottomLegendOffset({
        tickConfig,
        marginInputs,
      })
    : undefined;

  const margins = getChartMarginsFromText({
    tickFontSize,
    legendFontSize,
    fontFamily,
    bottomTickLabels: marginInputs.bottomTickLabels,
    leftTickLabels: marginInputs.leftTickLabels,
    xAxisLabel,
    yAxisLabel,
    tickRotation: getTickRotation(tickConfig),
    bottomLegendOffset,
  });

  return { margins, tickConfig, valueTickResult, bottomLegendOffset };
};
