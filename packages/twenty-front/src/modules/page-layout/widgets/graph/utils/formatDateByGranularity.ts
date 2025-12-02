import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

export const formatDateByGranularity = (
  date: Date,
  granularity:
    | ObjectRecordGroupByDateGranularity.DAY
    | ObjectRecordGroupByDateGranularity.MONTH
    | ObjectRecordGroupByDateGranularity.QUARTER
    | ObjectRecordGroupByDateGranularity.YEAR
    | ObjectRecordGroupByDateGranularity.WEEK
    | ObjectRecordGroupByDateGranularity.NONE,
): string => {
  switch (granularity) {
    case ObjectRecordGroupByDateGranularity.DAY:
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case ObjectRecordGroupByDateGranularity.WEEK: {
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startMonth = weekStart.toLocaleDateString(undefined, {
        month: 'short',
      });
      const endMonth = weekEnd.toLocaleDateString(undefined, {
        month: 'short',
      });
      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();
      const startYear = weekStart.getFullYear();
      const endYear = weekEnd.getFullYear();

      if (startYear !== endYear) {
        return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
      }

      if (startMonth !== endMonth) {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
      }

      return `${startMonth} ${startDay} - ${endDay}, ${endYear}`;
    }
    case ObjectRecordGroupByDateGranularity.MONTH:
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      });
    case ObjectRecordGroupByDateGranularity.QUARTER:
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case ObjectRecordGroupByDateGranularity.YEAR:
      return date.getFullYear().toString();
    case ObjectRecordGroupByDateGranularity.NONE:
    default:
      return date.toLocaleDateString();
  }
};
