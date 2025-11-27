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
    case ObjectRecordGroupByDateGranularity.WEEK:
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
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
