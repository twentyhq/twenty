import { ChartFilter } from '@/activities/charts/types/ChartFilter';

export interface Chart {
  id: string;
  name: string;
  description: string;
  measure: ChartMeasure;
  sourceObjectNameSingular: string;
  fieldPath: string;
  chartFilters: ChartFilter[];
  groupBy: string;
  result: any; // TODO
  resultCreatedAt: string;
  __typename: string;
}

export type ChartMeasure = 'average' | 'sum' | 'min' | 'max' | 'count';
