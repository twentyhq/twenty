// AST consumed by the `query` AI tool.
// It is a uniform, tagged syntax tree: every filter node carries a `type`
// discriminator, field names are data (dot-paths) rather than object keys, and
// operators are an enum. This is the deliberate counter-design to the
// key-overloaded filter object the find_many tool accepts, which models
// serialize less reliably.
//
// The AST is purely a front-end encoding. It is compiled down to the existing
// `ObjectRecordFilter` / `ObjectRecordOrderBy` / `ObjectRecordGroupBy` shapes,
// so it exposes no capability the structured tools do not already have.

// Every operator the per-field filter schemas accept, unioned across field
// types. Validity per field is enforced at compile time against the field's
// own schema, not here.
export const QUERY_FILTER_OPERATORS = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'like',
  'ilike',
  'startsWith',
  'endsWith',
  'is',
  'containsIlike',
  'isEmptyArray',
] as const;

export type QueryFilterOperator = (typeof QUERY_FILTER_OPERATORS)[number];

export type QueryComparisonNode = {
  type: 'cmp';
  field: string;
  op: QueryFilterOperator;
  value?: unknown;
};

export type QueryFilterNode =
  | QueryComparisonNode
  | { type: 'and'; of: QueryFilterNode[] }
  | { type: 'or'; of: QueryFilterNode[] }
  | { type: 'not'; node: QueryFilterNode };

export type QueryOrderByItem = {
  field: string;
  direction: 'asc' | 'desc';
  nulls?: 'first' | 'last';
};

export type QueryGroupByItem = {
  field: string;
  // Only honoured for date fields; ignored otherwise.
  granularity?: string;
  timeZone?: string;
  weekStartDay?: string;
};

export type QueryAggregate = {
  groupBy: QueryGroupByItem[];
  operation: string;
  // Required for every operation other than COUNT.
  field?: string;
};

export type QueryAst = {
  from: string;
  select?: string[];
  where?: QueryFilterNode;
  orderBy?: QueryOrderByItem[];
  limit?: number;
  offset?: number;
  aggregate?: QueryAggregate;
};
