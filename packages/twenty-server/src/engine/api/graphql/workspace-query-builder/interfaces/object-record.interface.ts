export interface ObjectRecord {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ObjectRecordFilter = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Property in keyof ObjectRecord]: any;
};

export enum OrderByDirection {
  AscNullsFirst = 'AscNullsFirst',
  AscNullsLast = 'AscNullsLast',
  DescNullsFirst = 'DescNullsFirst',
  DescNullsLast = 'DescNullsLast',
}

export type ObjectRecordOrderBy = Array<{
  [Property in keyof ObjectRecord]?:
    | OrderByDirection
    | Record<string, OrderByDirection>;
}>;

export interface ObjectRecordDuplicateCriteria {
  objectName: string;
  columnNames: string[];
}
