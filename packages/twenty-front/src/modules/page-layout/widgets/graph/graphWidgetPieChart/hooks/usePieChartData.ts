import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { calculatePieChartAngles } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartAngles';
import { calculatePieChartPercentage } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartPercentage';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { type DatumId } from '@nivo/pie';
import { useMemo } from 'react';

type UsePieChartDataProps = {
  data: PieChartDataItem[];
  colorRegistry: GraphColorRegistry;
  hoveredSliceId: DatumId | null;
};

export const usePieChartData = ({
  data,
  colorRegistry,
  hoveredSliceId,
}: UsePieChartDataProps) => {
  const enrichedData = useMemo((): PieChartEnrichedData[] => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    let cumulativeAngle = 0;
    return data.map((item, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: item.color,
        fallbackIndex: index,
        totalGroups: data.length,
      });

      const isHovered = hoveredSliceId === item.id;
      const percentage = calculatePieChartPercentage(item.value, totalValue);

      const angles = calculatePieChartAngles(percentage, cumulativeAngle);
      cumulativeAngle = angles.newCumulativeAngle;

      return {
        ...item,
        colorScheme,
        isHovered,
        percentage,
        middleAngle: angles.middleAngle,
      };
    });
  }, [data, colorRegistry, hoveredSliceId]);

  const enrichedDataMap = useMemo(
    () => new Map(enrichedData.map((item) => [item.id, item])),
    [enrichedData],
  );

  return {
    enrichedData,
    enrichedDataMap,
  };
};
