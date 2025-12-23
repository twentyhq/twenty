import { type FillDateGapsResult } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/FillDateGapsResult';
import { createEmptyDateGroup } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/createEmptyDateGroup';
import {
  getDateGroupsFromData,
  type SupportedDateGranularity,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getDateGroupsFromData';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { type GraphOrderBy } from '~/generated/graphql';

type OneDimensionalFillParams = {
  data: GroupByRawResult[];
  keys: string[];
  dateGranularity: SupportedDateGranularity;
  orderBy?: GraphOrderBy | null;
};

// TODO: should handle DATE and DATE_TIME here
export const fillDateGapsInOneDimensionalBarChartData = ({
  data,
  keys,
  dateGranularity,
  orderBy,
}: OneDimensionalFillParams): FillDateGapsResult => {
  const existingDateGroupsMap = new Map<string, GroupByRawResult>();
  const parsedDates: Temporal.PlainDate[] = [];

  for (const item of data) {
    const dateValue = item.groupByDimensionValues?.[0];

    if (!isDefined(dateValue)) {
      continue;
    }

    const parsedDate = Temporal.PlainDate.from(String(dateValue));

    parsedDates.push(parsedDate);
    existingDateGroupsMap.set(parsedDate.toString(), item);
  }

  if (parsedDates.length === 0) {
    return { data, wasTruncated: false };
  }

  const { dates: allDates, wasTruncated } = getDateGroupsFromData({
    parsedDates,
    dateGranularity,
    orderBy,
  });

  const filledData = allDates.map((date) => {
    const key = date.toString();
    const existingDateGroup = existingDateGroupsMap.get(key);

    return isDefined(existingDateGroup)
      ? existingDateGroup
      : createEmptyDateGroup([date], keys);
  });

  return { data: filledData, wasTruncated };
};
