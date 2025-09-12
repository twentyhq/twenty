import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
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
      const colorScheme = getColorScheme(colorRegistry, item.color, index);
      const isHovered = hoveredSliceId === item.id;
      const gradientId = `${colorScheme.name}Gradient-${id}-${index}`;
      const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;

      const sliceAngle = (percentage / 100) * 360;
      const middleAngle = cumulativeAngle + sliceAngle / 2;
      cumulativeAngle += sliceAngle;

      return {
        ...item,
        gradientId,
        colorScheme,
        isHovered,
        percentage,
        middleAngle,
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

  return {
    enrichedData,
    defs,
    fill,
  };
};
