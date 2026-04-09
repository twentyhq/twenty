import {
  type FirstDayOfTheWeek,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type GroupByRegularField = {
  fieldMetadata: FlatFieldMetadata;
  subFieldName?: string;
  shouldUnnest?: boolean;
};

export type GroupByDateField = {
  fieldMetadata: FlatFieldMetadata;
  subFieldName?: string;
  dateGranularity: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};

export type GroupByRelationField = {
  fieldMetadata: FlatFieldMetadata;
  nestedFieldMetadata: FlatFieldMetadata;
  nestedSubFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};

export type GroupByField =
  | GroupByRegularField
  | GroupByDateField
  | GroupByRelationField;
