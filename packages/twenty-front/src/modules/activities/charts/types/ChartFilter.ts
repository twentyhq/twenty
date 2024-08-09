// TODO - Should charts have share filters with the rest of the app?

export interface ChartFilter {
  id: string;
  chartId: string;
  field: string;
  operator: ChartFilterOperator;
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

export type ChartFilterOperator = NumberOperator | StringOperator;
