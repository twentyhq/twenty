import { generateDateGroupsInRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/generateDateGroupsInRange';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

export type SupportedDateGranularity =
  | ObjectRecordGroupByDateGranularity.DAY
  | ObjectRecordGroupByDateGranularity.MONTH
  | ObjectRecordGroupByDateGranularity.QUARTER
  | ObjectRecordGroupByDateGranularity.YEAR
  | ObjectRecordGroupByDateGranularity.WEEK;

export const getDateGroupsFromData = (
  parsedDates: Date[],
  dateGranularity: SupportedDateGranularity,
): { dates: Date[]; wasTruncated: boolean } => {
  const timestamps = parsedDates.map((date) => date.getTime());
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));

  const result = generateDateGroupsInRange({
    startDate: minDate,
    endDate: maxDate,
    granularity: dateGranularity,
  });

  return { dates: result.dates, wasTruncated: result.wasTruncated };
};
