export interface ObjectRecord {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ObjectRecordFilter = Partial<{
  [Property in keyof ObjectRecord]: unknown;
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
