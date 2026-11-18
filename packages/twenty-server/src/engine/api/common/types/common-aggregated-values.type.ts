export type CommonAggregatedValues = Record<string, number>;

export type CommonRelationAggregatedValues = {
  valuesByParentRecordId: Partial<Record<string, CommonAggregatedValues>>;
  relations: CommonRelationsAggregatedValues;
};

export type CommonRelationsAggregatedValues = Partial<
  Record<string, CommonRelationAggregatedValues>
>;
