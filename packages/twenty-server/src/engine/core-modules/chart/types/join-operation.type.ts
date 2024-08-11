export interface JoinOperation {
  joinTableName: string;
  joinTableAlias: string;
  joinFieldName: string;

  existingTableAlias: string;
  existingFieldName: string;
}
