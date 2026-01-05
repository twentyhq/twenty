import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type ComputeBarChartSlicesParams = {
  bars: readonly ComputedBarDatum<BarDatum>[];
  innerWidth: number;
  innerHeight: number;
  layout: BarChartLayout;
};

export const computeBarChartSlices = ({
  bars,
  innerWidth,
  innerHeight,
  layout,
}: ComputeBarChartSlicesParams): BarChartSlice[] => {
  if (bars.length === 0) {
    return [];
  }

  const isVertical = layout === BarChartLayout.VERTICAL;

  const groupedBars = new Map<string, ComputedBarDatum<BarDatum>[]>();

  for (const bar of bars) {
    const key = String(bar.data.indexValue);
    const existing = groupedBars.get(key);
    if (isDefined(existing)) {
      existing.push(bar);
    } else {
      groupedBars.set(key, [bar]);
    }
  }

  const slices: BarChartSlice[] = [];

  for (const [indexValue, groupBars] of groupedBars) {
    let minPosition = Infinity;
    let maxPosition = -Infinity;
    let minAnchor = Infinity;
    let maxAnchor = -Infinity;

    for (const bar of groupBars) {
      if (isVertical) {
        minPosition = Math.min(minPosition, bar.x);
        maxPosition = Math.max(maxPosition, bar.x + bar.width);
        minAnchor = Math.min(minAnchor, bar.y);
        maxAnchor = Math.max(maxAnchor, bar.y + bar.height);
      } else {
        minPosition = Math.min(minPosition, bar.y);
        maxPosition = Math.max(maxPosition, bar.y + bar.height);
        minAnchor = Math.min(minAnchor, bar.x);
        maxAnchor = Math.max(maxAnchor, bar.x + bar.width);
      }
    }

    const sliceCenter = (minPosition + maxPosition) / 2;

    const hasPositiveValues = groupBars.some(
      (bar) => Number(bar.data.value) >= 0,
    );
    const hasNegativeValues = groupBars.some(
      (bar) => Number(bar.data.value) < 0,
    );
    const isAllNegative = hasNegativeValues && !hasPositiveValues;

    const anchorY = isVertical
      ? isAllNegative
        ? maxAnchor
        : minAnchor
      : sliceCenter;

    const anchorX = isVertical
      ? sliceCenter
      : isAllNegative
        ? minAnchor
        : maxAnchor;

    slices.push({
      indexValue,
      bars: [...groupBars],
      sliceLeft: minPosition,
      sliceRight: maxPosition,
      sliceCenter,
      anchorX,
      anchorY,
      isAllNegative,
    });
  }

  slices.sort((a, b) => a.sliceLeft - b.sliceLeft);

  const totalDimension = isVertical ? innerWidth : innerHeight;

  const originalBoundaries = slices.map((slice) => ({
    left: slice.sliceLeft,
    right: slice.sliceRight,
  }));

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    const previousOriginalBoundary = originalBoundaries[i - 1];
    const nextOriginalBoundary = originalBoundaries[i + 1];
    const currentOriginalBoundary = originalBoundaries[i];

    if (isDefined(previousOriginalBoundary)) {
      slice.sliceLeft =
        (previousOriginalBoundary.right + currentOriginalBoundary.left) / 2;
    } else {
      slice.sliceLeft = 0;
    }

    if (isDefined(nextOriginalBoundary)) {
      slice.sliceRight =
        (currentOriginalBoundary.right + nextOriginalBoundary.left) / 2;
    } else {
      slice.sliceRight = totalDimension;
    }
  }

  return slices;
};

export const findSliceAtPosition = (
  slices: BarChartSlice[],
  position: number,
): BarChartSlice | null => {
  for (const slice of slices) {
    if (position >= slice.sliceLeft && position <= slice.sliceRight) {
      return slice;
    }
  }
  return null;
};
