type AggregateValues = {
  [key in string]: string;
};

type GroupByDimensionValues = {
  groupByDimensionValues: string[];
};

type Records = {
  records?: Record<string, unknown>[];
};

export type CommonGroupByOutputItem = GroupByDimensionValues &
  AggregateValues &
  Records;
