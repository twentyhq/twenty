import { t } from '@lingui/core/macro';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

export const getDateGranularityLabel = (
  granularity: ObjectRecordGroupByDateGranularity,
): string => {
  switch (granularity) {
    case ObjectRecordGroupByDateGranularity.DAY:
      return t`Day`;
    case ObjectRecordGroupByDateGranularity.WEEK:
      return t`Week`;
    case ObjectRecordGroupByDateGranularity.MONTH:
      return t`Month`;
    case ObjectRecordGroupByDateGranularity.QUARTER:
      return t`Quarter`;
    case ObjectRecordGroupByDateGranularity.YEAR:
      return t`Year`;
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      return t`Day of the week`;
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      return t`Month of the year`;
    case ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR:
      return t`Quarter of the year`;
    case ObjectRecordGroupByDateGranularity.NONE:
      return t`None`;
    default:
      return granularity;
  }
};
