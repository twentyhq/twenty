import { type BarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type SortBarChartDataBySecondaryDimensionSumParams = {
  data: BarDatum[];
  keys: string[];
  orderBy: GraphOrderBy;
};

export const sortBarChartDataBySecondaryDimensionSum = ({
  data,
  keys,
  orderBy,
}: SortBarChartDataBySecondaryDimensionSumParams): BarDatum[] => {
  if (
    orderBy !== GraphOrderBy.VALUE_ASC &&
    orderBy !== GraphOrderBy.VALUE_DESC
  ) {
    return data;
  }

  const dataWithSecondaryDimensionSums = data.map((datum) => {
    const secondaryDimensionSum = keys.reduce((sumAccumulator, segmentKey) => {
      const segmentValue = datum[segmentKey];

      if (isDefined(segmentValue) && typeof segmentValue === 'number') {
        return sumAccumulator + segmentValue;
      }

      return sumAccumulator;
    }, 0);

    return { datum, secondaryDimensionSum };
  });

  dataWithSecondaryDimensionSums.sort((a, b) => {
    if (orderBy === GraphOrderBy.VALUE_ASC) {
      return a.secondaryDimensionSum - b.secondaryDimensionSum;
    } else {
      return b.secondaryDimensionSum - a.secondaryDimensionSum;
    }
  });

  return dataWithSecondaryDimensionSums.map(({ datum }) => datum);
};
