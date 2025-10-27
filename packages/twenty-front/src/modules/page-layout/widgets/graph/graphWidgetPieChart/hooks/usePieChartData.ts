import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { calculatePieChartAngles } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartAngles';
import { calculatePieChartPercentage } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartPercentage';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { createGradientDef } from '@/page-layout/widgets/graph/utils/createGradientDef';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { type DatumId } from '@nivo/pie';
import { useMemo } from 'react';

type UsePieChartDataProps = {
  data: PieChartDataItem[];
  colorRegistry: GraphColorRegistry;
  id: string;
  hoveredSliceId: DatumId | null;
};

export const usePieChartData = ({
  data,
  colorRegistry,
  id,
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
      const gradientId = `${colorScheme.name}Gradient-${id}-${index}`;
      const percentage = calculatePieChartPercentage(item.value, totalValue);

      const angles = calculatePieChartAngles(percentage, cumulativeAngle);
      cumulativeAngle = angles.newCumulativeAngle;

      return {
        ...item,
        gradientId,
        colorScheme,
        isHovered,
        percentage,
        middleAngle: angles.middleAngle,
      };
    });
  }, [data, colorRegistry, id, hoveredSliceId]);

  const defs = useMemo(() => {
    return enrichedData.map((item) =>
      createGradientDef(
        item.colorScheme,
        item.gradientId,
        item.isHovered,
        item.middleAngle,
      ),
    );
  }, [enrichedData]);

  const fill = useMemo(() => {
    return enrichedData.map((item) => ({
      match: { id: item.id },
      id: item.gradientId,
    }));
  }, [enrichedData]);

  const enrichedDataMap = useMemo(
    () => new Map(enrichedData.map((item) => [item.id, item])),
    [enrichedData],
  );

  return {
    enrichedData,
    enrichedDataMap,
    defs,
    fill,
  };
};
