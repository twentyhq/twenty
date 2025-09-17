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
  ObjectRecordGroupByForAtomicField | ObjectRecordGroupByForCompositeField
>;

export type ObjectRecordGroupByForAtomicField = Partial<{
  [Property in keyof ObjectRecord]: boolean;
}>;

export type ObjectRecordGroupByForCompositeField = Partial<{
  [Property in keyof ObjectRecord]: Record<string, boolean>;
}>;

export enum OrderByDirection {
  AscNullsFirst = 'AscNullsFirst',
  AscNullsLast = 'AscNullsLast',
  DescNullsFirst = 'DescNullsFirst',
  DescNullsLast = 'DescNullsLast',
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
