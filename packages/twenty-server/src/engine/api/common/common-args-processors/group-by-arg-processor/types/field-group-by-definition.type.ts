import {
  type FirstDayOfTheWeek,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

export type CompositeFieldGroupByDefinition = Record<string, boolean>;

export type DateFieldGroupByDefinition = {
  granularity: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};

export type FieldGroupByDefinition =
  | boolean
  | CompositeFieldGroupByDefinition
  | DateFieldGroupByDefinition
  | undefined;
