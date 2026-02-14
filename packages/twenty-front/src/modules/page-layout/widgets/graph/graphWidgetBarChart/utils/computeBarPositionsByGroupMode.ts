import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { computeBarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';
import { computeGroupedBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeGroupedBarPositions';
import { computeStackedBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeStackedBarPositions';
import { type BarChartLayout } from '~/generated-metadata/graphql';

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
  innerPadding: number;
  shouldRoundFreeEndMap: Map<string, boolean> | null;
  includeZeroValues?: boolean;
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
    return computeStackedBarPositions({
      ctx,
      data,
      indexBy,
      keys,
      enrichedKeysMap,
      valueDomain,
      shouldRoundFreeEndMap,
      includeZeroValues,
    });
  }

  return computeGroupedBarPositions({
    ctx,
    data,
    indexBy,
    keys,
    enrichedKeysMap,
    innerPadding,
    shouldRoundFreeEndMap,
    includeZeroValues,
  });
};
