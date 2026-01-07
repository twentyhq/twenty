import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
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

  const seriesLookups = series.map(
    (seriesItem) => new Map(seriesItem.data.map((point) => [point.x, point.y])),
  );

  const xValueSums = new Map<
    LineChartDataPoint['x'],
    LineChartDataPoint['y']
  >();

  for (const xValue of allXValues) {
    const sum = seriesLookups.reduce((accumulator, lookup) => {
      return accumulator + (lookup.get(xValue) ?? 0);
    }, 0);
    xValueSums.set(xValue, sum);
  }

  const sortedXValues = allXValues.toSorted((a, b) => {
    const sumA = xValueSums.get(a) ?? 0;
    const sumB = xValueSums.get(b) ?? 0;

    return orderBy === GraphOrderBy.VALUE_ASC ? sumA - sumB : sumB - sumA;
  });

  const xValueToIndex = new Map<LineChartDataPoint['x'], number>(
    sortedXValues.map((xValue, index) => [xValue, index]),
  );

  return series.map((seriesItem) => ({
    ...seriesItem,
    data: seriesItem.data.toSorted((a, b) => {
      const indexA = xValueToIndex.get(a.x) ?? 0;
      const indexB = xValueToIndex.get(b.x) ?? 0;

      return indexA - indexB;
    }),
  }));
};
