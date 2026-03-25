import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isCyclicalDateGranularity = (
  granularity?: ObjectRecordGroupByDateGranularity | null,
): boolean => {
  if (!isDefined(granularity)) return false;
  return [
    ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
    ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
    ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
  ].includes(granularity);
};
