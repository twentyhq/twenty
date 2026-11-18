export type CommonAggregatedValues = Record<string, number>;

// Mirrors CommonSelection['relations']: one relation query aggregates over every parent at its level
export type CommonRelationAggregatedValues = {
  valuesByParentRecordId: Partial<Record<string, CommonAggregatedValues>>;
  relations: CommonRelationsAggregatedValues;
};

export type CommonRelationsAggregatedValues = Partial<
  Record<string, CommonRelationAggregatedValues>
>;
