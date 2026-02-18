import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';
import { computeBottomTickPosition } from '@/page-layout/widgets/graph/chart-core/utils/computeBottomTickPosition';
import { computeLeftTickPosition } from '@/page-layout/widgets/graph/chart-core/utils/computeLeftTickPosition';
import { getChartInnerDimensions } from '@/page-layout/widgets/graph/chart-core/utils/getChartInnerDimensions';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { type AxisLayerConfig } from '@/page-layout/widgets/graph/chart-core/types/AxisLayerConfig';

type GetAxisLayerLayoutParams = {
  bottomAxisTickRotation: number;
  categoryValues: (string | number)[];
  categoryTickValues: (string | number)[];
  chartHeight: number;
  chartWidth: number;
  hasNegativeValues: boolean;
  isVertical: boolean;
  margins: ChartMargins;
  valueDomain: { min: number; max: number };
  valueTickValues: number[];
  axisConfig: AxisLayerConfig;
};

type AxisLayerLayout = {
  innerWidth: number;
  innerHeight: number;
  bottomTickValues: (string | number)[];
  leftTickValues: (string | number)[];
  getBottomTickPosition: (value: string | number, index: number) => number;
  getLeftTickPosition: (value: string | number, index: number) => number;
  hasRotation: boolean;
  bottomLegendOffset: number;
  leftLegendOffset: number;
  shouldRenderZeroLine: boolean;
  zeroPosition: number;
};

export const getAxisLayerLayout = ({
  bottomAxisTickRotation,
  categoryValues,
  categoryTickValues,
  chartHeight,
  chartWidth,
  hasNegativeValues,
  isVertical,
  margins,
  valueDomain,
  valueTickValues,
  axisConfig,
}: GetAxisLayerLayoutParams): AxisLayerLayout => {
  const { innerWidth, innerHeight } = getChartInnerDimensions({
    chartWidth,
    chartHeight,
    margins,
  });

  const categoryIndexMap = new Map<string, number>(
    categoryValues.map((value, index) => [String(value), index]),
  );

  const categoryScale = computeBandScale({
    axisLength: isVertical ? innerWidth : innerHeight,
    count: categoryValues.length,
    padding: axisConfig.categoryPadding,
    outerPaddingPx: axisConfig.categoryOuterPaddingPx,
  });

  const bottomTickValues = isVertical ? categoryTickValues : valueTickValues;
  const leftTickValues = isVertical ? valueTickValues : categoryTickValues;

  const getBottomTickPosition = (value: string | number, index: number) =>
    computeBottomTickPosition({
      value,
      index,
      isVertical,
      categoryValues,
      categoryIndexMap,
      categoryScale,
      valueDomain,
      innerWidth,
    });

  const getLeftTickPosition = (value: string | number, index: number) =>
    computeLeftTickPosition({
      value,
      index,
      isVertical,
      categoryValues,
      categoryIndexMap,
      categoryScale,
      valueDomain,
      innerHeight,
    });

  const hasRotation = bottomAxisTickRotation !== 0;

  const rotatedLabelsExtraMargin = hasRotation
    ? axisConfig.rotatedLabelsExtraMargin
    : 0;
  const bottomLegendOffset = Math.min(
    axisConfig.bottomAxisLegendOffset + rotatedLabelsExtraMargin,
    Math.max(margins.bottom - axisConfig.legendOffsetMarginBuffer, 0),
  );

  const leftLegendOffset =
    -margins.left + axisConfig.leftAxisLegendOffsetPadding;

  const valueRange = valueDomain.max - valueDomain.min;
  const shouldRenderZeroLine = hasNegativeValues && valueRange !== 0;
  const zeroPosition = shouldRenderZeroLine
    ? isVertical
      ? innerHeight - ((0 - valueDomain.min) / valueRange) * innerHeight
      : ((0 - valueDomain.min) / valueRange) * innerWidth
    : 0;

  return {
    innerWidth,
    innerHeight,
    bottomTickValues,
    leftTickValues,
    getBottomTickPosition,
    getLeftTickPosition,
    hasRotation,
    bottomLegendOffset,
    leftLegendOffset,
    shouldRenderZeroLine,
    zeroPosition,
  };
};
