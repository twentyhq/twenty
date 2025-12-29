import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';

import { type Temporal } from 'temporal-polyfill';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import {
  assertUnreachable,
  isPlainDateBeforeOrEqual,
} from 'twenty-shared/utils';

type GenerateDateRangeParams = {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  granularity:
    | ObjectRecordGroupByDateGranularity.DAY
    | ObjectRecordGroupByDateGranularity.WEEK
    | ObjectRecordGroupByDateGranularity.MONTH
    | ObjectRecordGroupByDateGranularity.QUARTER
    | ObjectRecordGroupByDateGranularity.YEAR;
};

type GenerateDateRangeResult = {
  dates: Temporal.PlainDate[];
  wasTruncated: boolean;
};

export const generateDateGroupsInRange = ({
  startDate,
  endDate,
  granularity,
}: GenerateDateRangeParams): GenerateDateRangeResult => {
  const dates: Temporal.PlainDate[] = [];

  let iterations = 0;
  let wasTruncated = false;

  let currentDateCursor = startDate;

  while (isPlainDateBeforeOrEqual(currentDateCursor, endDate)) {
    if (iterations >= BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS) {
      wasTruncated = true;
      break;
    }

    dates.push(currentDateCursor);
    iterations++;

    switch (granularity) {
      case ObjectRecordGroupByDateGranularity.DAY:
        currentDateCursor = currentDateCursor.add({ days: 1 });
        break;

      case ObjectRecordGroupByDateGranularity.WEEK:
        currentDateCursor = currentDateCursor.add({ weeks: 1 });
        break;

      case ObjectRecordGroupByDateGranularity.MONTH:
        currentDateCursor = currentDateCursor.add({ months: 1 });
        break;

      case ObjectRecordGroupByDateGranularity.QUARTER:
        currentDateCursor = currentDateCursor.add({ months: 3 });
        break;

      case ObjectRecordGroupByDateGranularity.YEAR:
        currentDateCursor = currentDateCursor.add({ years: 1 });
        break;

      default:
        assertUnreachable(granularity);
    }
  }

  return { dates, wasTruncated };
};
