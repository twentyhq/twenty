import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartEnrichedKey';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { type BarPosition } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarPosition';
import { computeBarPositions } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computeBarPositions';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { useMemo } from 'react';
import { type BarChartLayout } from '~/generated-metadata/graphql';

type UseBarPositionsParams = {
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
  innerPadding: number;
  includeZeroValues?: boolean;
  enabled?: boolean;
};

export const useMemoizedBarPositions = ({
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
  innerPadding,
  includeZeroValues = false,
  enabled = true,
}: UseBarPositionsParams): BarPosition[] => {
  return useMemo(() => {
    if (!enabled) {
      return [];
    }

    return computeBarPositions({
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
      innerPadding,
      includeZeroValues,
    });
  }, [
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
    innerPadding,
    includeZeroValues,
    enabled,
  ]);
};
