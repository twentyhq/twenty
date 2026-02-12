import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';
import { isNumber } from '@sniptt/guards';

type StackState = {
  positiveStackPixel: number;
  negativeStackPixel: number;
};

type GetBarDimensionsResult = {
  dimensions: { x: number; y: number; width: number; height: number };
  nextStackState: StackState;
};

type BuildBarsParams = {
  ctx: BarPositionContext;
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  shouldRoundFreeEndMap: Map<string, boolean> | null;
  includeZeroValues: boolean;
  getDimensions: (params: {
    ctx: BarPositionContext;
    categoryStart: number;
    keyIndex: number;
    value: number;
    stackState: StackState;
  }) => GetBarDimensionsResult;
};

export const buildBars = ({
  ctx,
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  shouldRoundFreeEndMap,
  includeZeroValues,
  getDimensions,
}: BuildBarsParams): BarPosition[] => {
  const { isVertical, dataLength, keysLength, categoryStep, outerPadding } =
    ctx;
  const bars: BarPosition[] = [];

  for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
    const dataPoint = data[dataIndex];
    const indexValue = String(dataPoint[indexBy]);
    const effectiveIndex = isVertical ? dataIndex : dataLength - 1 - dataIndex;
    const categoryStart = outerPadding + effectiveIndex * categoryStep;

    let stackState: StackState = {
      positiveStackPixel: ctx.zeroPixel,
      negativeStackPixel: ctx.zeroPixel,
    };

    for (let keyIndex = 0; keyIndex < keysLength; keyIndex++) {
      const key = keys[keyIndex];
      const rawValue = dataPoint[key];

      if (!isNumber(rawValue) || (!includeZeroValues && rawValue === 0)) {
        continue;
      }

      const value = rawValue;
      const enrichedKeyForSeries = enrichedKeysMap.get(
        key,
      ) as BarChartEnrichedKey;
      const color = enrichedKeyForSeries.colorScheme.solid;
      const barKey = JSON.stringify([indexValue, key]);
      const shouldRoundFreeEnd = shouldRoundFreeEndMap?.get(barKey) ?? true;

      const { dimensions, nextStackState } = getDimensions({
        ctx,
        categoryStart,
        keyIndex,
        value,
        stackState,
      });
      stackState = nextStackState;

      bars.push({
        ...dimensions,
        value,
        indexValue,
        seriesId: key,
        color,
        shouldRoundFreeEnd,
        seriesIndex: keyIndex,
      });
    }
  }

  return bars;
};
