export type AggregationType = 'SUM' | 'COUNT' | 'MAX' | 'MIN' | 'AVG';

export type Operator =
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'notIn'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export type DynamicValue = 'startOfYear';

export interface FilterConfig {
  field: string;
  operator: Operator;
  value?: string | number | boolean | Array<string | number | boolean>;
  dynamicValue?: DynamicValue;
}

export interface AggregationConfig {
  type: AggregationType;
  parentField: string;
  childField?: string;
  currencyField?: string;
  filters?: FilterConfig[];
}

export interface RollupDefinition {
  parentObject: string;
  childObject: string;
  relationField: string;
  childFilters?: FilterConfig[];
  aggregations: AggregationConfig[];
}

export type RollupConfig = RollupDefinition[];

export type ChildRecord = Record<string, unknown>;

export interface ExecutionSummaryItem {
  parentObject: string;
  processed: number;
  updated: number;
  mode: 'full-rebuild' | 'targeted';
  relationField: string;
  skipped?: string;
}
