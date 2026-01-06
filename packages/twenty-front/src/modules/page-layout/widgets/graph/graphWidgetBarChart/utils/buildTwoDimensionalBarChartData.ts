import { type ProcessedTwoDimensionalDataPoint } from '@/page-layout/widgets/graph/utils/processTwoDimensionalGroupByResults';
import { type BarDatum } from '@nivo/bar';

type BuildTwoDimensionalBarChartDataParams = {
  processedDataPoints: ProcessedTwoDimensionalDataPoint[];
  indexByKey: string;
};

type BuildTwoDimensionalBarChartDataResult = {
  unsortedData: BarDatum[];
  yValues: Set<string>;
};

export const buildTwoDimensionalBarChartData = ({
  processedDataPoints,
  indexByKey,
}: BuildTwoDimensionalBarChartDataParams): BuildTwoDimensionalBarChartDataResult => {
  const dataMap = new Map<string, BarDatum>();
  const yValues = new Set<string>();

  for (const { xValue, yValue, aggregateValue } of processedDataPoints) {
    yValues.add(yValue);

    if (!dataMap.has(xValue)) {
      dataMap.set(xValue, {
        [indexByKey]: xValue,
      });
    }

    const dataItem = dataMap.get(xValue)!;
    dataItem[yValue] = aggregateValue;
  }

  return {
    unsortedData: Array.from(dataMap.values()),
    yValues,
  };
};
