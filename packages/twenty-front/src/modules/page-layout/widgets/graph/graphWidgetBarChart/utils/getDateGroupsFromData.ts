import { generateDateGroupsInRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/generateDateGroupsInRange';
import { type Temporal } from 'temporal-polyfill';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined, sortPlainDate } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

export type SupportedDateGranularity =
  | ObjectRecordGroupByDateGranularity.DAY
  | ObjectRecordGroupByDateGranularity.MONTH
  | ObjectRecordGroupByDateGranularity.QUARTER
  | ObjectRecordGroupByDateGranularity.YEAR
  | ObjectRecordGroupByDateGranularity.WEEK;

type GetDateGroupsFromDataParams = {
  parsedDates: Temporal.PlainDate[];
  dateGranularity: SupportedDateGranularity;
  orderBy?: GraphOrderBy | null;
};

export const getDateGroupsFromData = ({
  parsedDates,
  dateGranularity,
  orderBy,
}: GetDateGroupsFromDataParams): {
  dates: Temporal.PlainDate[];
  wasTruncated: boolean;
} => {
  const sortedPlainDates = parsedDates.toSorted(sortPlainDate('asc'));

  const minDate = sortedPlainDates.at(0);
  const maxDate = sortedPlainDates.at(-1);

  if (!isDefined(minDate) || !isDefined(maxDate)) {
    return { dates: [], wasTruncated: false };
  }

  const result = generateDateGroupsInRange({
    startDate: minDate,
    endDate: maxDate,
    granularity: dateGranularity,
  });

  const dates =
    orderBy === GraphOrderBy.FIELD_DESC
      ? result.dates.toReversed()
      : result.dates;

  return { dates, wasTruncated: result.wasTruncated };
};
