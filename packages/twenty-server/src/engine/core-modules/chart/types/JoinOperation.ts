export interface JoinOperation {
  joinTableName: string; // TODO: Rename fields, four is enough
  fromTableName: string;
  fromFieldName: string;
  toFieldName?: string;
  toTableName: string;
}
