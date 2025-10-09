import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

export const formatDateByGranularity = (
  date: Date,
  granularity: ObjectRecordGroupByDateGranularity,
): string => {
  switch (granularity) {
    case ObjectRecordGroupByDateGranularity.DAY:
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
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      return date.toLocaleDateString(undefined, { month: 'long' });
    case ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR:
      return `Q${Math.floor(date.getMonth() / 3) + 1}`;
    case ObjectRecordGroupByDateGranularity.NONE:
    default:
      return date.toLocaleDateString();
  }
};
