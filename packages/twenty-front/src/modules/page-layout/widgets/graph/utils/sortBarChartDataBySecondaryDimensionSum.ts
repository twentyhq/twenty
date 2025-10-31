import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type SortBarChartDataBySecondaryDimensionSumParams = {
  data: BarChartDataItem[];
  keys: string[];
  orderBy: GraphOrderBy;
};

// Sums secondary dimension values (e.g., all statuses per city) and sorts by those totals.
// The backend orders by individual (X, Y) combinations, but for grouped/stacked bars we want to
// order by the total across secondary dimension. This follows the same pattern as omitNullValues
// and range filters which are also handled client-side for visualization purposes.
export const sortBarChartDataBySecondaryDimensionSum = ({
  data,
  keys,
  orderBy,
}: SortBarChartDataBySecondaryDimensionSumParams): BarChartDataItem[] => {
  if (
    orderBy !== GraphOrderBy.VALUE_ASC &&
    orderBy !== GraphOrderBy.VALUE_DESC
  ) {
    return data;
  }

  const dataWithSecondaryDimensionSums = data.map((barChartDataItem) => {
    const secondaryDimensionSum = keys.reduce((sumAccumulator, segmentKey) => {
      const segmentValue = barChartDataItem[segmentKey];
      if (isDefined(segmentValue) && typeof segmentValue === 'number') {
        return sumAccumulator + segmentValue;
      }
      return sumAccumulator;
    }, 0);

    return { barChartDataItem, secondaryDimensionSum };
  });

  dataWithSecondaryDimensionSums.sort((a, b) => {
    if (orderBy === GraphOrderBy.VALUE_ASC) {
      return a.secondaryDimensionSum - b.secondaryDimensionSum;
    } else {
      return b.secondaryDimensionSum - a.secondaryDimensionSum;
    }
  });

  return dataWithSecondaryDimensionSums.map(
    ({ barChartDataItem }) => barChartDataItem,
  );
};
