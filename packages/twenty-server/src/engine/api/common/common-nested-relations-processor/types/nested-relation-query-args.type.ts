import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type NestedRelationQueryArgs = {
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  nestedRelationQueryArgsByFieldName: NestedRelationQueryArgsByFieldName;
};

export type NestedRelationQueryArgsByFieldName = Partial<
  Record<string, NestedRelationQueryArgs>
>;
