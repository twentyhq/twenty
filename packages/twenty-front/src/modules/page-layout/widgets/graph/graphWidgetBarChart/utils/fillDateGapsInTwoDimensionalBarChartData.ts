import { type FillDateGapsResult } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/FillDateGapsResult';
import {
  createEmptyDateGroup,
  type DimensionValue,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/createEmptyDateGroup';
import {
  getDateGroupsFromData,
  type SupportedDateGranularity,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getDateGroupsFromData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { isDefined } from 'twenty-shared/utils';
import { type GraphOrderBy } from '~/generated/graphql';

type TwoDimensionalFillParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: SupportedDateGranularity;
  orderBy?: GraphOrderBy | null;
};

export const fillDateGapsInTwoDimensionalBarChartData = ({
  data,
  keys,
  dateGranularity,
  orderBy,
}: TwoDimensionalFillParams): FillDateGapsResult => {
  const existingDateGroupsMap = new Map<string, GroupByRawResult>();
  const parsedDates: Date[] = [];
  const uniqueSecondDimensionValues = new Set<DimensionValue>();

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
      continue;
    }

    const parsedDate = new Date(String(dateValue));

    if (isNaN(parsedDate.getTime())) {
      continue;
    }

    parsedDates.push(parsedDate);

    const secondDimensionValue = (item.groupByDimensionValues?.[1] ??
      null) as DimensionValue;
    uniqueSecondDimensionValues.add(secondDimensionValue);

    const key = `${parsedDate.toISOString()}_${String(secondDimensionValue)}`;
    existingDateGroupsMap.set(key, item);
  }

  if (parsedDates.length === 0) {
    return { data, wasTruncated: false };
  }

  const { dates: allDates, wasTruncated } = getDateGroupsFromData({
    parsedDates,
    dateGranularity,
    orderBy,
  });

  const filledData = allDates.flatMap((date) =>
    Array.from(uniqueSecondDimensionValues).map((secondDimensionValue) => {
      const key = `${date.toISOString()}_${String(secondDimensionValue)}`;
      const existingDateGroup = existingDateGroupsMap.get(key);

      return isDefined(existingDateGroup)
        ? existingDateGroup
        : createEmptyDateGroup([date, secondDimensionValue], keys);
    }),
  );

  return { data: filledData, wasTruncated };
};
