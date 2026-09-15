import {
  type FirstDayOfTheWeek,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export type GroupByRegularField = {
  fieldMetadata: OrmFlatFieldMetadata;
  subFieldName?: string;
  shouldUnnest?: boolean;
};

export type GroupByDateField = {
  fieldMetadata: OrmFlatFieldMetadata;
  subFieldName?: string;
  dateGranularity: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};

export type GroupByRelationField = {
  fieldMetadata: OrmFlatFieldMetadata;
  nestedFieldMetadata: OrmFlatFieldMetadata;
  nestedSubFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};

export type GroupByField =
  | GroupByRegularField
  | GroupByDateField
  | GroupByRelationField;
