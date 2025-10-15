type aggregateValues = {
  [key: string]: number;
};

type groupByDimensionValues = {
  groupByDimensionValues: string[];
};

export type CommonGroupByOutputItem = aggregateValues & groupByDimensionValues;
