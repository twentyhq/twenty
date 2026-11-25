export type StoredFormulaRecordWatchPlan = {
  objectMetadataId: string;
  joinColumnName: string;
  watchedFieldNames: ReadonlySet<string>;
};

export type StoredFormulaWatchPlans = {
  relatedRecordWatchPlansByObjectMetadataId: Partial<
    Record<string, StoredFormulaRecordWatchPlan[]>
  >;
  // Unlike related plans, the join column is on the records to mark, which point to the watched one
  lookedUpRecordWatchPlansByObjectMetadataId: Partial<
    Record<string, StoredFormulaRecordWatchPlan[]>
  >;
  // Every object holding a stored formula has an entry, even when its formulas read none of its own fields
  watchedOwnFieldNamesByObjectMetadataId: Partial<
    Record<string, ReadonlySet<string>>
  >;
};
