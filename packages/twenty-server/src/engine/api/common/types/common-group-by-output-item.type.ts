type AggregateValues = {
  [key: string]: number;
};

type GroupByDimensionValues = {
  groupByDimensionValues: string[];
};

export type CommonGroupByOutputItem = AggregateValues & GroupByDimensionValues;
