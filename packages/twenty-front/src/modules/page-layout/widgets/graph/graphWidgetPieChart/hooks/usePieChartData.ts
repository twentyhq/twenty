import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { calculatePieChartPercentage } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartPercentage';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo } from 'react';

type UsePieChartDataProps = {
  data: PieChartDataItem[];
  colorRegistry: GraphColorRegistry;
};

export const usePieChartData = ({
  data,
  colorRegistry,
}: UsePieChartDataProps) => {
  const hiddenLegendIds = useRecoilComponentValue(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const allEnrichedData = useMemo((): PieChartEnrichedData[] => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return data.map((item, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: item.color,
        fallbackIndex: index,
        totalGroups: data.length,
      });

      const percentage = calculatePieChartPercentage(item.value, totalValue);

      return {
        ...item,
        colorScheme,
        percentage,
      };
    });
  }, [data, colorRegistry]);

  const legendItems: GraphWidgetLegendItem[] = allEnrichedData.map((item) => ({
    id: item.id,
    label: String(item.id),
    color: item.colorScheme.solid,
  }));

  const enrichedData = allEnrichedData.filter(
    (item) => !hiddenLegendIds.includes(item.id),
  );

  const enrichedDataMap = useMemo(
    () => new Map(enrichedData.map((item) => [item.id, item])),
    [enrichedData],
  );

  return {
    enrichedData,
    enrichedDataMap,
    legendItems,
  };
};
