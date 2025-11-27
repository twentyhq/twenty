import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { calculatePieChartPercentage } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartPercentage';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useMemo } from 'react';

type UsePieChartDataProps = {
  data: PieChartDataItem[];
  colorRegistry: GraphColorRegistry;
};

export const usePieChartData = ({
  data,
  colorRegistry,
}: UsePieChartDataProps) => {
  const enrichedData = useMemo((): PieChartEnrichedData[] => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return data.map((item, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
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

  const enrichedDataMap = useMemo(
    () => new Map(enrichedData.map((item) => [item.id, item])),
    [enrichedData],
  );

  return {
    enrichedData,
    enrichedDataMap,
  };
};
