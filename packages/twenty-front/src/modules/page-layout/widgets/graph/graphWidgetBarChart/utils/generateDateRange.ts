import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMaximumNumberOfBars.constant';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

type GenerateDateRangeParams = {
  startDate: Date;
  endDate: Date;
  granularity:
    | ObjectRecordGroupByDateGranularity.DAY
    | ObjectRecordGroupByDateGranularity.MONTH
    | ObjectRecordGroupByDateGranularity.QUARTER
    | ObjectRecordGroupByDateGranularity.YEAR;
};

export const generateDateRange = ({
  startDate,
  endDate,
  granularity,
}: GenerateDateRangeParams): Date[] => {
  const dates: Date[] = [];

  let iterations = 0;

  let currentDateCursor = new Date(startDate);

  while (
    currentDateCursor <= endDate &&
    iterations < BAR_CHART_MAXIMUM_NUMBER_OF_BARS
  ) {
    dates.push(new Date(currentDateCursor));
    iterations++;

    switch (granularity) {
      case ObjectRecordGroupByDateGranularity.DAY:
        currentDateCursor.setDate(currentDateCursor.getDate() + 1);
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

  return dates;
};
