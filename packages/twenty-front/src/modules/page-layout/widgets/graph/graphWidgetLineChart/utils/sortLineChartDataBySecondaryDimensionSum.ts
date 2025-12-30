import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { GraphOrderBy } from '~/generated/graphql';

type SortLineChartDataBySecondaryDimensionSumParams = {
  series: LineChartSeries[];
  orderBy: GraphOrderBy;
};

export const sortLineChartDataBySecondaryDimensionSum = ({
  series,
  orderBy,
}: SortLineChartDataBySecondaryDimensionSumParams): LineChartSeries[] => {
  if (series.length === 0) {
    return series;
  }

  const allXValues = series[0].data.map((point) => point.x);

  const xValueSums = new Map<string | number | Date, number>();

  for (const xValue of allXValues) {
    const sum = series.reduce((accumulator, seriesItem) => {
      const point = seriesItem.data.find((dataPoint) => dataPoint.x === xValue);
      return accumulator + (point?.y ?? 0);
    }, 0);
    xValueSums.set(xValue, sum);
  }

  const sortedXValues = allXValues.toSorted((a, b) => {
    const sumA = xValueSums.get(a) ?? 0;
    const sumB = xValueSums.get(b) ?? 0;

    if (orderBy === GraphOrderBy.VALUE_ASC) {
      return sumA - sumB;
    } else {
      return sumB - sumA;
    }
  });

  const xValueToIndex = new Map<string | number | Date, number>();

  sortedXValues.forEach((xValue, index) => {
    xValueToIndex.set(xValue, index);
  });

  return series.map((seriesItem) => ({
    ...seriesItem,
    data: seriesItem.data.toSorted((a, b) => {
      const indexA = xValueToIndex.get(a.x) ?? 0;
      const indexB = xValueToIndex.get(b.x) ?? 0;
      return indexA - indexB;
    }),
  }));
};
