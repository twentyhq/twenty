import { AnalyticsQuery } from '@/activities/charts/types/AnalyticsQuery';

export interface AnalyticsQueryFilter {
  id: string;
  analyticsQuery: AnalyticsQuery;
  analyticsQueryId: string;
  field: string;
  operator: AnalyticsQueryFilterOperator;
  value: string;
  __typename: string;
}

type NumberOperator =
  | 'is'
  | 'is not'
  | 'less than'
  | 'greater than'
  | 'empty'
  | 'not empty';

type StringOperator =
  | 'contains'
  | 'not contains'
  | 'starts with'
  | 'end with'
  | 'is'
  | 'is not'
  | 'empty'
  | 'not empty';

export type AnalyticsQueryFilterOperator = NumberOperator | StringOperator;
