export type RelationAggregateValues = {
  [relationFieldName: string]: {
    [aggregateGqlFieldName: string]: string | number | null | undefined;
  };
};
