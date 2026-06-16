import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type CompiledFindQuery = {
  kind: 'find';
  filter: ObjectRecordFilter;
  orderBy: ObjectRecordOrderBy;
  select: string[];
  limit?: number;
  offset?: number;
};

export type CompiledAggregateQuery = {
  kind: 'aggregate';
  filter: ObjectRecordFilter;
  groupBy: ObjectRecordGroupBy;
  operation: string;
  field?: string;
  limit?: number;
};

export type CompiledQuery = CompiledFindQuery | CompiledAggregateQuery;
