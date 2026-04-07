export type GroupByRecordsResult = {
  groups: Array<{ dimensions: string[]; value: string | number | null }>;
  dimensionLabels: string[];
  aggregation: string;
  groupCount: number;
};
