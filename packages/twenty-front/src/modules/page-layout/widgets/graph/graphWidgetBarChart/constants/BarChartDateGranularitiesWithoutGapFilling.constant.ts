import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

export const BAR_CHART_DATE_GRANULARITIES_WITHOUT_GAP_FILLING = new Set([
  ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
  ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
  ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
  ObjectRecordGroupByDateGranularity.NONE,
]);
