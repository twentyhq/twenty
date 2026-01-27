import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';
import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';
import { isNumber } from '@sniptt/guards';
import { BarChartLayout } from '~/generated/graphql';

type ComputeStackedBarPositionsParams = {
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  innerWidth: number;
  innerHeight: number;
  layout: BarChartLayout;
  valueDomain: { min: number; max: number };
  fallbackColor: string;
  shouldRoundFreeEndMap: Map<string, boolean> | null;
  includeZeroValues?: boolean;
};

export const computeStackedBarPositions = ({
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  innerWidth,
  innerHeight,
  layout,
  valueDomain,
  fallbackColor,
  shouldRoundFreeEndMap,
  includeZeroValues = false,
}: ComputeStackedBarPositionsParams): BarPosition[] => {
  const bars: BarPosition[] = [];
  const dataLength = data.length;
  const keysLength = keys.length;
  const isVertical = layout === BarChartLayout.VERTICAL;

  if (dataLength === 0 || keysLength === 0) {
    return bars;
  }

  const categoryAxisLength = isVertical ? innerWidth : innerHeight;
  const valueAxisLength = isVertical ? innerHeight : innerWidth;

  const {
    step: categoryStep,
    bandwidth: categoryWidth,
    offset: outerPadding,
  } = computeBandScale({
    axisLength: categoryAxisLength,
    count: dataLength,
    padding: BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO,
    outerPaddingPx: BAR_CHART_CONSTANTS.OUTER_PADDING_PX,
  });

  const barThickness = Math.min(
    categoryWidth,
    BAR_CHART_CONSTANTS.MAXIMUM_WIDTH,
  );
  const categoryBarCenteringOffset = (categoryWidth - barThickness) / 2;

  const { valueToPixel } = computeValueScale({
    domain: valueDomain,
    axisLength: valueAxisLength,
  });
  const zeroPixel = valueToPixel(0);
  const { valueToPixel: stackValueToPixel, range: stackRange } =
    computeValueScale({
      domain: { min: 0, max: valueDomain.max - valueDomain.min },
      axisLength: valueAxisLength,
    });

  for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
    const dataPoint = data[dataIndex];
    const indexValue = String(dataPoint[indexBy]);
    const effectiveIndex = isVertical ? dataIndex : dataLength - 1 - dataIndex;
    const categoryStart = outerPadding + effectiveIndex * categoryStep;

    let positiveStackPixel = zeroPixel;
    let negativeStackPixel = zeroPixel;

    for (let keyIndex = 0; keyIndex < keysLength; keyIndex++) {
      const key = keys[keyIndex];
      const rawValue = dataPoint[key];

      if (!isNumber(rawValue) || (!includeZeroValues && rawValue === 0)) {
        continue;
      }

      const value = rawValue;
      const enrichedKey = enrichedKeysMap.get(key);
      const color = enrichedKey?.colorScheme.solid ?? fallbackColor;

      const barKey = JSON.stringify([indexValue, key]);
      const shouldRoundFreeEnd = shouldRoundFreeEndMap?.get(barKey) ?? true;

      const isNegative = value < 0;
      const valuePixelDelta =
        stackRange === 0 ? 0 : stackValueToPixel(Math.abs(value));

      const categoryPosition = categoryStart + categoryBarCenteringOffset;

      if (isVertical) {
        if (isNegative) {
          bars.push({
            x: categoryPosition,
            y: valueAxisLength - negativeStackPixel,
            width: barThickness,
            height: valuePixelDelta,
            value,
            indexValue,
            seriesId: key,
            color,
            shouldRoundFreeEnd,
            seriesIndex: keyIndex,
          });
          negativeStackPixel -= valuePixelDelta;
        } else {
          positiveStackPixel += valuePixelDelta;
          bars.push({
            x: categoryPosition,
            y: valueAxisLength - positiveStackPixel,
            width: barThickness,
            height: valuePixelDelta,
            value,
            indexValue,
            seriesId: key,
            color,
            shouldRoundFreeEnd,
            seriesIndex: keyIndex,
          });
        }
      } else {
        if (isNegative) {
          negativeStackPixel -= valuePixelDelta;
          bars.push({
            x: negativeStackPixel,
            y: categoryPosition,
            width: valuePixelDelta,
            height: barThickness,
            value,
            indexValue,
            seriesId: key,
            color,
            shouldRoundFreeEnd,
            seriesIndex: keyIndex,
          });
        } else {
          bars.push({
            x: positiveStackPixel,
            y: categoryPosition,
            width: valuePixelDelta,
            height: barThickness,
            value,
            indexValue,
            seriesId: key,
            color,
            shouldRoundFreeEnd,
            seriesIndex: keyIndex,
          });
          positiveStackPixel += valuePixelDelta;
        }
      }
    }
  }

  return bars;
};
