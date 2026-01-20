import { type GraphWidgetLegendItem } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { type PieChartDataItemWithColor } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { type PieChartEnrichedData } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartEnrichedData';
import { calculatePieChartPercentage } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartPercentage';
import { graphWidgetHiddenLegendIdsComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHiddenLegendIdsComponentState';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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
  const hiddenLegendIds = useRecoilComponentValue(
    graphWidgetHiddenLegendIdsComponentState,
  );

  const allEnrichedData = useMemo((): PieChartEnrichedData[] => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const shouldApplyGradient = colorMode === 'explicitSingleColor';

    return data.map((item, index) => {
      const colorScheme = getColorScheme({
        registry: colorRegistry,
        colorName: item.color,
        fallbackIndex: index,
        totalGroups: shouldApplyGradient ? data.length : undefined,
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
