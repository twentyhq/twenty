import { type CompiledQuery } from 'src/engine/core-modules/record-query-language/types/compiled-query.type';

export type QueryCompileErrorCode =
  | 'unknown_field'
  | 'field_not_filterable'
  | 'composite_subfield_required'
  | 'operator_not_allowed'
  | 'value_type_mismatch'
  | 'relation_path_too_deep';

export type QueryCompileError = {
  // Location inside the AST, e.g. "where.of[1].field" or "select[0]".
  path: string;
  code: QueryCompileErrorCode;
  message: string;
  // Closest valid identifier when the failure is a typo.
  suggestion?: string;
};

export type QueryCompileResult =
  | { ok: true; query: CompiledQuery }
  | { ok: false; errors: QueryCompileError[] };
