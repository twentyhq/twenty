import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graph-widget-pie-chart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graph-widget-pie-chart/types/PieChartEnrichedData';
import { calculatePieChartPercentage } from '@/page-layout/widgets/graph/graph-widget-pie-chart/utils/calculatePieChartPercentage';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { buildAlphabeticalRankByKey } from '@/page-layout/widgets/graph/utils/buildAlphabeticalRankByKey';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';

type UsePieChartDataProps = {
  data: PieChartDataItemWithColor[];
  colorRegistry: GraphColorRegistry;
  colorMode: GraphColorMode;
};

export const usePieChartData = ({
  data,
  colorRegistry,
  colorMode,
}: UsePieChartDataProps) => {
  const graphWidgetHiddenLegendIds = useAtomComponentStateValue(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const allEnrichedData = useMemo((): PieChartEnrichedData[] => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const gradientRankByKey =
      colorMode === 'explicitSingleColor'
        ? buildAlphabeticalRankByKey(data.map((item) => item.key))
        : undefined;

    return data.map((item) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: item.color,
        colorKey: item.key,
        groupIndex: gradientRankByKey?.get(item.key),
        totalGroups: gradientRankByKey?.size,
      });

      const percentage = calculatePieChartPercentage(item.value, totalValue);

      return {
        ...item,
        colorScheme,
        percentage,
      };
    });
  }, [data, colorRegistry, colorMode]);

  const legendItems: GraphWidgetLegendItem[] = allEnrichedData.map((item) => ({
    id: item.key,
    label: String(item.key),
    color: item.colorScheme.solid,
  }));

  const enrichedData = allEnrichedData.filter(
    (item) => !graphWidgetHiddenLegendIds.includes(item.key),
  );

  const enrichedDataMap = useMemo(
    () => new Map(enrichedData.map((item) => [item.key, item])),
    [enrichedData],
  );

  return {
    enrichedData,
    enrichedDataMap,
    legendItems,
  };
};
