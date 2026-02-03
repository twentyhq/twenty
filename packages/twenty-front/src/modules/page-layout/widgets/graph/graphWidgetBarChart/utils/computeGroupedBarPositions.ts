import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';
import { buildBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/buildBars';
import {
  computeGroupedBarLayout,
  getGroupedBarDimensions,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getGroupedBarDimensions';

type ComputeGroupedBarPositionsParams = {
  ctx: BarPositionContext;
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  innerPadding: number;
  shouldRoundFreeEndMap: Map<string, boolean> | null;
  includeZeroValues?: boolean;
};

export const computeGroupedBarPositions = ({
  ctx,
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  innerPadding,
  shouldRoundFreeEndMap,
  includeZeroValues = false,
}: ComputeGroupedBarPositionsParams): BarPosition[] => {
  const groupedLayout = computeGroupedBarLayout(ctx, innerPadding);
  return buildBars({
    ctx,
    data,
    indexBy,
    keys,
    enrichedKeysMap,
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
