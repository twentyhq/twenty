import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { computeBarPositionsByGroupMode } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositionsByGroupMode';
import { computeShouldRoundFreeEndMap } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeShouldRoundFreeEndMap';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { type BarChartLayout } from '~/generated/graphql';

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

  const shouldRoundFreeEndMap = computeShouldRoundFreeEndMap({
    data,
    keys,
    indexBy,
    groupMode,
  });

  return computeBarPositionsByGroupMode({
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
    includeZeroValues,
  });
};
