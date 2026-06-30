export type RecordIndexGroupByQueryResult = {
  [groupByQueryResultGqlFieldName: string]: ({
    groupByDimensionValues: string[];
  } & {
    [aggregateGqlField: string]: string | number;
  })[];
};
