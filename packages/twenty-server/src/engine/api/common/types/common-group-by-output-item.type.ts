type AggregateValues = {
  [key: string]: string;
};

type GroupByDimensionValues = {
  groupByDimensionValues: string[];
};

export type CommonGroupByOutputItem = AggregateValues & GroupByDimensionValues;
