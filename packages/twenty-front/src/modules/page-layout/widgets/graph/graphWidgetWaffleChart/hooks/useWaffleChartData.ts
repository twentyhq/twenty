import { type WaffleChartDataItem } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartDataItem';
import { type WaffleChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/types/WaffleChartEnrichedData';
import { calculateWaffleChartPercentage } from '@/page-layout/widgets/graph/graphWidgetWaffleChart/utils/calculateWaffleChartPercentage';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useMemo } from 'react';

type UseWaffleChartDataProps = {
  data: WaffleChartDataItem[];
  colorRegistry: GraphColorRegistry;
};

export const useWaffleChartData = ({
  data,
  colorRegistry,
}: UseWaffleChartDataProps) => {
  const enrichedData = useMemo((): WaffleChartEnrichedData[] => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    return data.map((item, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: item.color,
        fallbackIndex: index,
        totalGroups: data.length,
      });

      const percentage = calculateWaffleChartPercentage(item.value, totalValue);

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
