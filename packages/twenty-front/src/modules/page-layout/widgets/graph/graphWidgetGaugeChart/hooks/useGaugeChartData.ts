import { type GaugeChartData } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/types/GaugeChartData';
import { type GraphColorRegistry } from '@/page-layout/widgets/graph/types/GraphColorRegistry';
import { getColorScheme } from '@/page-layout/widgets/graph/utils/getColorScheme';
import { useMemo } from 'react';

type UseGaugeChartDataProps = {
  data: GaugeChartData;
  colorRegistry: GraphColorRegistry;
};

export const useGaugeChartData = ({
  data,
  colorRegistry,
}: UseGaugeChartDataProps) => {
  const { value, min, max, color = 'blue' } = data;

  const colorScheme = useMemo(
    () =>
      getColorScheme({
        registry: colorRegistry,
        colorName: color,
      }),
    [colorRegistry, color],
  );

  const normalizedValue = useMemo(
    () => (max === min ? 0 : ((value - min) / (max - min)) * 100),
    [value, min, max],
  );

  const clampedNormalizedValue = useMemo(
    () => Math.max(0, Math.min(100, normalizedValue)),
    [normalizedValue],
  );

  const chartData = useMemo(
    () => [
      {
        id: 'gauge',
        data: [
          { x: 'value', y: clampedNormalizedValue },
          { x: 'empty', y: 100 - clampedNormalizedValue },
        ],
      },
    ],
    [clampedNormalizedValue],
  );

  return {
    colorScheme,
    normalizedValue,
    clampedNormalizedValue,
    chartData,
  };
};
