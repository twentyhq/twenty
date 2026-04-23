import { t } from '@lingui/core/macro';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getDateGranularityPluralLabel = (
  granularity: ObjectRecordGroupByDateGranularity,
): string => {
  switch (granularity) {
    case ObjectRecordGroupByDateGranularity.DAY:
      return t`days`;
    case ObjectRecordGroupByDateGranularity.WEEK:
      return t`weeks`;
    case ObjectRecordGroupByDateGranularity.MONTH:
      return t`months`;
    case ObjectRecordGroupByDateGranularity.QUARTER:
      return t`quarters`;
    case ObjectRecordGroupByDateGranularity.YEAR:
      return t`years`;
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      return t`days`;
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      return t`months`;
    case ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR:
      return t`quarters`;
    case ObjectRecordGroupByDateGranularity.NONE:
      return t`items`;
    default:
      assertUnreachable(granularity);
  }
};
