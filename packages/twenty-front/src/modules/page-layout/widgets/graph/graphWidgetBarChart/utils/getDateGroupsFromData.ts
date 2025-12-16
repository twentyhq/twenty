import { generateDateGroupsInRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/generateDateGroupsInRange';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { GraphOrderBy } from '~/generated/graphql';

export type SupportedDateGranularity =
  | ObjectRecordGroupByDateGranularity.DAY
  | ObjectRecordGroupByDateGranularity.MONTH
  | ObjectRecordGroupByDateGranularity.QUARTER
  | ObjectRecordGroupByDateGranularity.YEAR
  | ObjectRecordGroupByDateGranularity.WEEK;

type GetDateGroupsFromDataParams = {
  parsedDates: Date[];
  dateGranularity: SupportedDateGranularity;
  orderBy?: GraphOrderBy | null;
};

export const getDateGroupsFromData = ({
  parsedDates,
  dateGranularity,
  orderBy,
}: GetDateGroupsFromDataParams): { dates: Date[]; wasTruncated: boolean } => {
  const timestamps = parsedDates.map((date) => date.getTime());
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));

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
