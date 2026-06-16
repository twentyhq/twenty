import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type QueryCompileErrorCode =
  | 'unknown_field'
  | 'field_not_filterable'
  | 'composite_subfield_required'
  | 'operator_not_allowed'
  | 'value_type_mismatch'
  | 'relation_path_too_deep'
  | 'unknown_aggregate_operation';

export type QueryCompileError = {
  // Location inside the AST, e.g. "where.of[1].field" or "select[0]".
  path: string;
  code: QueryCompileErrorCode;
  message: string;
  // Closest valid identifier when the failure is a typo.
  suggestion?: string;
};

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

export type QueryCompileResult =
  | { ok: true; query: CompiledQuery; warnings: string[] }
  | { ok: false; errors: QueryCompileError[] };
