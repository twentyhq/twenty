export interface Chart {
  id: string;
  name: string;
  description: string;
  measure: ChartMeasure;
  sourceObjectNameSingular: string;
  fieldPath: string;
  groupBy: string;
  result: any; // TODO
  resultCreatedAt: string;
  __typename: string;
}

export type ChartMeasure = 'average' | 'sum' | 'min' | 'max' | 'count';
