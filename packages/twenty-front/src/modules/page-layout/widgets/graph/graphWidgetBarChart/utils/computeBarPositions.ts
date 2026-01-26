import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { isNumber } from '@sniptt/guards';
import { BarChartLayout } from '~/generated/graphql';

import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';
import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';

export type BarPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  indexValue: string;
  seriesId: string;
  color: string;
  shouldRoundFreeEnd: boolean;
  seriesIndex: number;
};

type ComputeBarPositionsParams = {
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  chartWidth: number;
  chartHeight: number;
  margins: ChartMargins;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
  valueDomain: { min: number; max: number };
  fallbackColor: string;
  innerPadding: number;
  includeZeroValues?: boolean;
};

const computeGroupedBarPositions = ({
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  innerWidth,
  innerHeight,
  layout,
  valueDomain,
  fallbackColor,
  innerPadding,
  shouldRoundFreeEndMap,
  includeZeroValues = false,
}: {
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  innerWidth: number;
  innerHeight: number;
  layout: BarChartLayout;
  valueDomain: { min: number; max: number };
  fallbackColor: string;
  innerPadding: number;
  shouldRoundFreeEndMap: Map<string, boolean> | null;
  includeZeroValues?: boolean;
}): BarPosition[] => {
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

  const totalInnerPadding = innerPadding * (keysLength - 1);
  const availableBarSpace = categoryWidth - totalInnerPadding;
  const barThickness = Math.min(
    Math.max(
      availableBarSpace / keysLength,
      BAR_CHART_CONSTANTS.MINIMUM_BAR_WIDTH,
    ),
    BAR_CHART_CONSTANTS.MAXIMUM_WIDTH,
  );
  const actualTotalBarWidth = barThickness * keysLength + totalInnerPadding;
  const groupCenteringOffset = (categoryWidth - actualTotalBarWidth) / 2;

  const { valueToPixel } = computeValueScale({
    domain: valueDomain,
    axisLength: valueAxisLength,
  });
  const zeroPixel = valueToPixel(0);

  for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
    const dataPoint = data[dataIndex];
    const indexValue = String(dataPoint[indexBy]);
    const effectiveIndex = isVertical ? dataIndex : dataLength - 1 - dataIndex;
    const categoryStart = outerPadding + effectiveIndex * categoryStep;

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

      const valuePixel = valueToPixel(value);
      const barStart = Math.min(zeroPixel, valuePixel);
      const barLength = Math.abs(valuePixel - zeroPixel);

      const categoryPosition =
        categoryStart +
        groupCenteringOffset +
        keyIndex * (barThickness + innerPadding);

      if (isVertical) {
        bars.push({
          x: categoryPosition,
          y: valueAxisLength - barStart - barLength,
          width: barThickness,
          height: barLength,
          value,
          indexValue,
          seriesId: key,
          color,
          shouldRoundFreeEnd,
          seriesIndex: keyIndex,
        });
      } else {
        bars.push({
          x: barStart,
          y: categoryPosition,
          width: barLength,
          height: barThickness,
          value,
          indexValue,
          seriesId: key,
          color,
          shouldRoundFreeEnd,
          seriesIndex: keyIndex,
        });
      }
    }
  }

  return bars;
};

const computeStackedBarPositions = ({
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
}: {
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
}): BarPosition[] => {
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

export const computeBarPositions = ({
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  chartWidth,
  chartHeight,
  margins,
  layout,
  groupMode,
  valueDomain,
  fallbackColor,
  innerPadding,
  includeZeroValues = false,
}: ComputeBarPositionsParams): BarPosition[] => {
  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;

  if (innerWidth <= 0 || innerHeight <= 0) {
    return [];
  }

  const shouldRoundFreeEndMap =
    groupMode === 'stacked'
      ? computeShouldRoundFreeEndMapLocal({ data, keys, indexBy, groupMode })
      : null;

  if (groupMode === 'stacked') {
    return computeStackedBarPositions({
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
      includeZeroValues,
    });
  }

  return computeGroupedBarPositions({
    data,
    indexBy,
    keys,
    enrichedKeysMap,
    innerWidth,
    innerHeight,
    layout,
    valueDomain,
    fallbackColor,
    innerPadding,
    shouldRoundFreeEndMap,
    includeZeroValues,
  });
};

const computeShouldRoundFreeEndMapLocal = ({
  data,
  keys,
  indexBy,
  groupMode,
}: {
  data: BarChartDatum[];
  keys: string[];
  indexBy: string;
  groupMode?: 'grouped' | 'stacked';
}): Map<string, boolean> | null => {
  if (groupMode !== 'stacked' || !keys?.length || !data?.length || !indexBy) {
    return null;
  }

  const map = new Map<string, boolean>();

  for (const dataPoint of data) {
    const indexValue = dataPoint[indexBy];

    for (let seriesIndex = 0; seriesIndex < keys.length; seriesIndex++) {
      const key = keys[seriesIndex];
      const value = dataPoint[key];

      if (!isNumber(value) || value === 0) {
        continue;
      }

      const isNegative = value < 0;

      const keysAfterCurrent = keys.slice(seriesIndex + 1);
      const hasSameSignBarAfter = keysAfterCurrent.some((afterKey) => {
        const afterValue = dataPoint[afterKey];
        return (
          isNumber(afterValue) && (isNegative ? afterValue < 0 : afterValue > 0)
        );
      });

      map.set(JSON.stringify([indexValue, key]), !hasSameSignBarAfter);
    }
  }

  return map;
};
