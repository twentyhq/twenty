import { type ObjectRecord } from 'twenty-shared/types';

type AggregateValues = {
  [key: string]: string;
};

type GroupByDimensionValues = {
  groupByDimensionValues: string[];
};

type Records = {
  records?: ObjectRecord[];
};

export type CommonGroupByOutputItem = GroupByDimensionValues &
  AggregateValues &
  Records;
