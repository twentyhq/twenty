import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { type BarPositionContext } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionContext';
import { buildBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/buildBars';
import {
  computeStackedBarLayout,
  getStackedBarDimensions,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getStackedBarDimensions';

type ComputeStackedBarPositionsParams = {
  ctx: BarPositionContext;
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  valueDomain: { min: number; max: number };
  shouldRoundFreeEndMap: Map<string, boolean> | null;
  includeZeroValues?: boolean;
};

export const computeStackedBarPositions = ({
  ctx,
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  valueDomain,
  shouldRoundFreeEndMap,
  includeZeroValues = false,
}: ComputeStackedBarPositionsParams): BarPosition[] => {
  const stackedLayout = computeStackedBarLayout(ctx, valueDomain);
  return buildBars({
    ctx,
    data,
    indexBy,
    keys,
    enrichedKeysMap,
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
};
