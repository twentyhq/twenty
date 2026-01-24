import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { isNumber } from '@sniptt/guards';
import { BarChartLayout } from '~/generated/graphql';

import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';

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
  data: Record<string, unknown>[];
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
};

const computeValueToPixel = (
  value: number,
  valueDomain: { min: number; max: number },
  axisLength: number,
): number => {
  const range = valueDomain.max - valueDomain.min;
  if (range === 0) {
    return 0;
  }
  return ((value - valueDomain.min) / range) * axisLength;
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
}: {
  data: Record<string, unknown>[];
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

  const categoryWidth =
    (categoryAxisLength / dataLength) *
    (1 - BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO);
  const outerPadding =
    (categoryAxisLength * BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO) / 2;
  const categoryStep = categoryAxisLength / dataLength;

  const effectiveInnerPadding = innerPadding;
  const totalInnerPadding = effectiveInnerPadding * (keysLength - 1);
  const availableBarSpace = categoryWidth - totalInnerPadding;
  const barThickness = Math.min(
    Math.max(availableBarSpace / keysLength, BAR_CHART_CONSTANTS.MINIMUM_BAR_WIDTH),
    BAR_CHART_CONSTANTS.MAXIMUM_WIDTH,
  );
  const actualTotalBarWidth = barThickness * keysLength + totalInnerPadding;
  const groupCenteringOffset = (categoryWidth - actualTotalBarWidth) / 2;

  const zeroPixel = computeValueToPixel(0, valueDomain, valueAxisLength);

  for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
    const dataPoint = data[dataIndex];
    const indexValue = String(dataPoint[indexBy]);
    const categoryStart = outerPadding + dataIndex * categoryStep;

    for (let keyIndex = 0; keyIndex < keysLength; keyIndex++) {
      const key = keys[keyIndex];
      const rawValue = dataPoint[key];

      if (!isNumber(rawValue) || rawValue === 0) {
        continue;
      }

      const value = rawValue;
      const enrichedKey = enrichedKeysMap.get(key);
      const color = enrichedKey?.colorScheme.solid ?? fallbackColor;

      const barKey = JSON.stringify([indexValue, key]);
      const shouldRoundFreeEnd = shouldRoundFreeEndMap?.get(barKey) ?? true;

      const valuePixel = computeValueToPixel(value, valueDomain, valueAxisLength);
      const barStart = Math.min(zeroPixel, valuePixel);
      const barLength = Math.abs(valuePixel - zeroPixel);

      const categoryPosition =
        categoryStart + groupCenteringOffset + keyIndex * (barThickness + effectiveInnerPadding);

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
}: {
  data: Record<string, unknown>[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  innerWidth: number;
  innerHeight: number;
  layout: BarChartLayout;
  valueDomain: { min: number; max: number };
  fallbackColor: string;
  shouldRoundFreeEndMap: Map<string, boolean> | null;
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

  const categoryWidth =
    (categoryAxisLength / dataLength) *
    (1 - BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO);
  const outerPadding =
    (categoryAxisLength * BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO) / 2;
  const categoryStep = categoryAxisLength / dataLength;

  const barThickness = Math.min(categoryWidth, BAR_CHART_CONSTANTS.MAXIMUM_WIDTH);
  const categoryBarCenteringOffset = (categoryWidth - barThickness) / 2;

  const zeroPixel = computeValueToPixel(0, valueDomain, valueAxisLength);

  for (let dataIndex = 0; dataIndex < dataLength; dataIndex++) {
    const dataPoint = data[dataIndex];
    const indexValue = String(dataPoint[indexBy]);
    const categoryStart = outerPadding + dataIndex * categoryStep;

    let positiveStackPixel = zeroPixel;
    let negativeStackPixel = zeroPixel;

    for (let keyIndex = 0; keyIndex < keysLength; keyIndex++) {
      const key = keys[keyIndex];
      const rawValue = dataPoint[key];

      if (!isNumber(rawValue) || rawValue === 0) {
        continue;
      }

      const value = rawValue;
      const enrichedKey = enrichedKeysMap.get(key);
      const color = enrichedKey?.colorScheme.solid ?? fallbackColor;

      const barKey = JSON.stringify([indexValue, key]);
      const shouldRoundFreeEnd = shouldRoundFreeEndMap?.get(barKey) ?? true;

      const isNegative = value < 0;
      const valuePixelDelta = computeValueToPixel(
        Math.abs(value),
        { min: 0, max: valueDomain.max - valueDomain.min },
        valueAxisLength,
      );

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
  });
};

const computeShouldRoundFreeEndMapLocal = ({
  data,
  keys,
  indexBy,
  groupMode,
}: {
  data: Record<string, unknown>[];
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
