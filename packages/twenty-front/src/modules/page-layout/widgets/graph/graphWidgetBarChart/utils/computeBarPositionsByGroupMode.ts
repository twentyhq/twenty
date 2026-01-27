import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import {
  computeBarPositionContext,
  type BarPositionContext,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';
import {
  computeGroupedBarLayout,
  getGroupedBarDimensions,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getGroupedBarDimensions';
import {
  computeStackedBarLayout,
  getStackedBarDimensions,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getStackedBarDimensions';
import { isNumber } from '@sniptt/guards';
import { type BarChartLayout } from '~/generated/graphql';

type ComputeBarPositionsByGroupModeParams = {
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  innerWidth: number;
  innerHeight: number;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
  valueDomain: { min: number; max: number };
  fallbackColor: string;
  innerPadding: number;
  shouldRoundFreeEndMap: Map<string, boolean> | null;
  includeZeroValues?: boolean;
};

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
  fallbackColor: string;
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

const buildBars = ({
  ctx,
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  fallbackColor,
  shouldRoundFreeEndMap,
  includeZeroValues,
  getDimensions,
}: BuildBarsParams): BarPosition[] => {
  const { isVertical, dataLength, keysLength, categoryStep, outerPadding } = ctx;
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
      const enrichedKey = enrichedKeysMap.get(key);
      const color = enrichedKey?.colorScheme.solid ?? fallbackColor;
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

export const computeBarPositionsByGroupMode = ({
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  innerWidth,
  innerHeight,
  layout,
  groupMode,
  valueDomain,
  fallbackColor,
  innerPadding,
  shouldRoundFreeEndMap,
  includeZeroValues = false,
}: ComputeBarPositionsByGroupModeParams): BarPosition[] => {
  const ctx = computeBarPositionContext({
    data,
    keys,
    innerWidth,
    innerHeight,
    layout,
    valueDomain,
  });

  if (!ctx) {
    return [];
  }

  if (groupMode === 'stacked') {
    const stackedLayout = computeStackedBarLayout(ctx, valueDomain);
    return buildBars({
      ctx,
      data,
      indexBy,
      keys,
      enrichedKeysMap,
      fallbackColor,
      shouldRoundFreeEndMap,
      includeZeroValues,
      getDimensions: ({ ctx, categoryStart, value, stackState }) => {
        const { newPositiveStackPixel, newNegativeStackPixel, ...dimensions } =
          getStackedBarDimensions({
            ctx,
            layout: stackedLayout,
            categoryStart,
            value,
            positiveStackPixel: stackState.positiveStackPixel,
            negativeStackPixel: stackState.negativeStackPixel,
          });
        return {
          dimensions,
          nextStackState: {
            positiveStackPixel: newPositiveStackPixel,
            negativeStackPixel: newNegativeStackPixel,
          },
        };
      },
    });
  }

  const groupedLayout = computeGroupedBarLayout(ctx, innerPadding);
  return buildBars({
    ctx,
    data,
    indexBy,
    keys,
    enrichedKeysMap,
    fallbackColor,
    shouldRoundFreeEndMap,
    includeZeroValues,
    getDimensions: ({ ctx, categoryStart, keyIndex, value, stackState }) => ({
      dimensions: getGroupedBarDimensions({
        ctx,
        layout: groupedLayout,
        categoryStart,
        keyIndex,
        value,
      }),
      nextStackState: stackState,
    }),
  });
};
