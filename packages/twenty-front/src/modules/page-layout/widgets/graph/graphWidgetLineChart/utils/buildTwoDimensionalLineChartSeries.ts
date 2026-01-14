import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { type ProcessedTwoDimensionalDataPoint } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';

type BuildTwoDimensionalLineChartSeriesParams = {
  processedDataPoints: ProcessedTwoDimensionalDataPoint[];
  color?: GraphColor | null;
};

type BuildTwoDimensionalLineChartSeriesResult = {
  unsortedSeries: LineChartSeries[];
};

export const buildTwoDimensionalLineChartSeries = ({
  processedDataPoints,
  color,
}: BuildTwoDimensionalLineChartSeriesParams): BuildTwoDimensionalLineChartSeriesResult => {
  const seriesMap = new Map<string, Map<string, number>>();
  const allXValues: string[] = [];
  const xValueSet = new Set<string>();

  for (const { xValue, yValue, aggregateValue } of processedDataPoints) {
    const isNewX = !xValueSet.has(xValue);

    if (isNewX) {
      xValueSet.add(xValue);
      allXValues.push(xValue);
    }

    if (!seriesMap.has(yValue)) {
      seriesMap.set(yValue, new Map());
    }

    seriesMap.get(yValue)!.set(xValue, aggregateValue);
  }

  const unsortedSeries: LineChartSeries[] = Array.from(seriesMap.entries()).map(
    ([seriesKey, xToYMap]) => {
      const data: LineChartDataPoint[] = allXValues.map((xValue) => ({
        x: xValue,
        y: xToYMap.get(xValue) ?? 0,
      }));

      return {
        id: seriesKey,
        label: seriesKey,
        color: color ?? undefined,
        data,
      };
    },
  );

  return {
    unsortedSeries,
  };
};
