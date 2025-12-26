import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { type FirstDayOfTheWeek } from 'twenty-shared/utils';

export type DateFieldGroupByDefinition = {
  granularity: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};
