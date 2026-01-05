import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type ComputeBarChartSlicesParams = {
  bars: readonly ComputedBarDatum<BarDatum>[];
  layout: BarChartLayout;
};

export const computeBarChartSlices = ({
  bars,
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
    const hasNonZeroValue = groupBars.some(
      (bar) => isDefined(bar.data.value) && Number(bar.data.value) !== 0,
    );

    if (!hasNonZeroValue) {
      continue;
    }

    let minPosition = Infinity;
    let maxPosition = -Infinity;

    for (const bar of groupBars) {
      if (isVertical) {
        minPosition = Math.min(minPosition, bar.x);
        maxPosition = Math.max(maxPosition, bar.x + bar.width);
      } else {
        minPosition = Math.min(minPosition, bar.y);
        maxPosition = Math.max(maxPosition, bar.y + bar.height);
      }
    }

    const sliceCenter = (minPosition + maxPosition) / 2;

    slices.push({
      indexValue,
      bars: [...groupBars],
      sliceLeft: minPosition,
      sliceRight: maxPosition,
      sliceCenter,
    });
  }

  slices.sort((a, b) => a.sliceLeft - b.sliceLeft);

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
