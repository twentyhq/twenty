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

  const groupedBars = bars.reduce((map, bar) => {
    const key = String(bar.data.indexValue);
    const existing = map.get(key);
    if (isDefined(existing)) {
      existing.push(bar);
    } else {
      map.set(key, [bar]);
    }
    return map;
  }, new Map<string, ComputedBarDatum<BarDatum>[]>());

  const slices: BarChartSlice[] = [];

  for (const [indexValue, groupBars] of groupedBars) {
    const hasNonZeroValue = groupBars.some(
      (bar) => isDefined(bar.data.value) && Number(bar.data.value) !== 0,
    );

    if (!hasNonZeroValue) {
      continue;
    }

    const minPosition = Math.min(
      ...groupBars.map((bar) => (isVertical ? bar.x : bar.y)),
    );
    const maxPosition = Math.max(
      ...groupBars.map((bar) =>
        isVertical ? bar.x + bar.width : bar.y + bar.height,
      ),
    );

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
