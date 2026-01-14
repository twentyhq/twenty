import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type ComputeSlicesFromBarsParams = {
  bars: readonly ComputedBarDatum<BarDatum>[];
  isVerticalLayout: boolean;
};

export const computeSlicesFromBars = ({
  bars,
  isVerticalLayout,
}: ComputeSlicesFromBarsParams): BarChartSlice[] => {
  if (bars.length === 0) {
    return [];
  }

  const groupedBarsByIndex = new Map<string, ComputedBarDatum<BarDatum>[]>();

  for (const bar of bars) {
    const indexKey = String(bar.data.indexValue);
    const existingBars = groupedBarsByIndex.get(indexKey);
    if (isDefined(existingBars)) {
      existingBars.push(bar);
    } else {
      groupedBarsByIndex.set(indexKey, [bar]);
    }
  }

  const computedSlices: BarChartSlice[] = [];

  for (const [indexValue, barsInGroup] of groupedBarsByIndex) {
    const minPosition = Math.min(
      ...barsInGroup.map((bar) => (isVerticalLayout ? bar.x : bar.y)),
    );
    const maxPosition = Math.max(
      ...barsInGroup.map((bar) =>
        isVerticalLayout ? bar.x + bar.width : bar.y + bar.height,
      ),
    );

    computedSlices.push({
      indexValue,
      bars: [...barsInGroup],
      sliceLeft: minPosition,
      sliceRight: maxPosition,
      sliceCenter: (minPosition + maxPosition) / 2,
    });
  }

  computedSlices.sort((sliceA, sliceB) => sliceA.sliceLeft - sliceB.sliceLeft);

  return computedSlices;
};
