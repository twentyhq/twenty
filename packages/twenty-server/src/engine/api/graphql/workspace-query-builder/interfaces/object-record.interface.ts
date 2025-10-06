export interface ObjectRecord {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

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
    bucket: ObjectRecordGroupByDateBucket;
  };
}>;

export enum OrderByDirection {
  AscNullsFirst = 'AscNullsFirst',
  AscNullsLast = 'AscNullsLast',
  DescNullsFirst = 'DescNullsFirst',
  DescNullsLast = 'DescNullsLast',
}

export enum ObjectRecordGroupByDateBucket {
  DAY = 'DAY',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  DAY_OF_THE_WEEK = 'DAY_OF_THE_WEEK',
  QUARTER_OF_THE_YEAR = 'QUARTER_OF_THE_YEAR',
  MONTH_OF_THE_YEAR = 'MONTH_OF_THE_YEAR',
}

export type ObjectRecordOrderBy = Array<
  ObjectRecordOrderByForScalarField | ObjectRecordOrderByForCompositeField
>;

export type ObjectRecordOrderByForScalarField = {
  [Property in keyof ObjectRecord]?: OrderByDirection;
};

export type ObjectRecordOrderByForCompositeField = {
  [Property in keyof ObjectRecord]?: Record<string, OrderByDirection>;
};

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
