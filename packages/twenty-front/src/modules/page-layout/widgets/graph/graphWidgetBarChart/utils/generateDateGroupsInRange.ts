import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

type GenerateDateRangeParams = {
  startDate: Date;
  endDate: Date;
  granularity:
    | ObjectRecordGroupByDateGranularity.DAY
    | ObjectRecordGroupByDateGranularity.WEEK
    | ObjectRecordGroupByDateGranularity.MONTH
    | ObjectRecordGroupByDateGranularity.QUARTER
    | ObjectRecordGroupByDateGranularity.YEAR;
};

type GenerateDateRangeResult = {
  dates: Date[];
  wasTruncated: boolean;
};

export const generateDateGroupsInRange = ({
  startDate,
  endDate,
  granularity,
}: GenerateDateRangeParams): GenerateDateRangeResult => {
  const dates: Date[] = [];

  let iterations = 0;
  let wasTruncated = false;

  let currentDateCursor = new Date(startDate);

  while (currentDateCursor <= endDate) {
    if (iterations >= BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS) {
      wasTruncated = true;
      break;
    }

    dates.push(new Date(currentDateCursor));
    iterations++;

    switch (granularity) {
      case ObjectRecordGroupByDateGranularity.DAY:
        currentDateCursor.setDate(currentDateCursor.getDate() + 1);
        break;

      case ObjectRecordGroupByDateGranularity.WEEK:
        currentDateCursor.setDate(currentDateCursor.getDate() + 7);
        break;

      case ObjectRecordGroupByDateGranularity.MONTH:
        currentDateCursor.setMonth(currentDateCursor.getMonth() + 1);
        break;

      case ObjectRecordGroupByDateGranularity.QUARTER:
        currentDateCursor.setMonth(currentDateCursor.getMonth() + 3);
        break;

      case ObjectRecordGroupByDateGranularity.YEAR:
        currentDateCursor.setFullYear(currentDateCursor.getFullYear() + 1);
        break;

      default:
        assertUnreachable(granularity);
    }
  }

  return { dates, wasTruncated };
};
