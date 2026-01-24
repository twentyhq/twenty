import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import {
  computeBarPositions,
  type BarPosition,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarPositions';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useMemo } from 'react';
import { BarChartLayout } from '~/generated/graphql';

type UseBarPositionsParams = {
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

export const useBarPositions = ({
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
}: UseBarPositionsParams): BarPosition[] => {
  return useMemo(
    () =>
      computeBarPositions({
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
      }),
    [
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
    ],
  );
};
