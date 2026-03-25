import {
  type ObjectRecordGroupByDateGranularity,
  type FirstDayOfTheWeek,
} from 'twenty-shared/types';

export type DateFieldGroupByDefinition = {
  granularity: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};
