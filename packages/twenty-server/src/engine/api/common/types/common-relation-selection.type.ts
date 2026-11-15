import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

// Like SQL `field AS responseKey`: the relation's rows sit on the record under its response key
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
