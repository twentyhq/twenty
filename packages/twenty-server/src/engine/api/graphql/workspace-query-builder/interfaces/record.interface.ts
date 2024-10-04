export interface Record {
  id: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type RecordFilter = {
  [Property in keyof Record]: any;
};

export enum OrderByDirection {
  AscNullsFirst = 'AscNullsFirst',
  AscNullsLast = 'AscNullsLast',
  DescNullsFirst = 'DescNullsFirst',
  DescNullsLast = 'DescNullsLast',
}

export type RecordOrderBy = Array<{
  [Property in keyof Record]?: OrderByDirection;
}>;

export interface RecordDuplicateCriteria {
  objectName: string;
  columnNames: string[];
}
