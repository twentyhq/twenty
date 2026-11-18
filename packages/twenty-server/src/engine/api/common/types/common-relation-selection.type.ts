import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

// The relation's rows sit on the parent record under this selection's key
export type CommonRelationSelection = {
  fieldName: string;
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  relationSelections: CommonRelationSelections;
};

export type CommonRelationSelections = Partial<
  Record<string, CommonRelationSelection>
>;
