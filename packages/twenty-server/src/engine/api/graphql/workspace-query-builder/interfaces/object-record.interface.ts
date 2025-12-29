import {
  type ObjectRecord,
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForScalarField,
} from 'twenty-shared/types';
import { type FirstDayOfTheWeek } from 'twenty-shared/utils';

export type ObjectRecordFilter = Partial<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Property in keyof ObjectRecord]: any;
}>;

export type ObjectRecordGroupBy = Array<
  | ObjectRecordGroupByForAtomicField
  | ObjectRecordGroupByForCompositeField
  | ObjectRecordGroupByForDateField
>;

export type ObjectRecordGroupByForAtomicField = Partial<{
  [Property in keyof ObjectRecord]: boolean;
}>;

export type ObjectRecordGroupByForCompositeField = Partial<{
  [Property in keyof ObjectRecord]: Record<string, boolean>;
}>;

export type ObjectRecordGroupByForDateField = Partial<{
  [Property in keyof ObjectRecord]: {
    granularity: ObjectRecordGroupByDateGranularity;
    weekStartDay?: FirstDayOfTheWeek;
    timeZone?: string;
  };
}>;

export type ObjectRecordOrderBy = Array<
  ObjectRecordOrderByForScalarField | ObjectRecordOrderByForCompositeField
>;

export type ObjectRecordCursorLeafScalarValue = string | number | boolean;
export type ObjectRecordCursorLeafCompositeValue = Record<
  string,
  ObjectRecordCursorLeafScalarValue
>;

export type ObjectRecordCursor = {
  [Property in keyof ObjectRecord]?:
    | ObjectRecordCursorLeafScalarValue
    | ObjectRecordCursorLeafCompositeValue;
};

export interface ObjectRecordDuplicateCriteria {
  objectName: string;
  columnNames: string[];
}
