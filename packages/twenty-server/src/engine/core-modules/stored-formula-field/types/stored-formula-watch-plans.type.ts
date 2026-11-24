export type StoredFormulaRelatedRecordWatchPlan = {
  objectMetadataId: string;
  joinColumnName: string;
  watchedFieldNames: ReadonlySet<string>;
};

export type StoredFormulaWatchPlans = {
  relatedRecordWatchPlansByObjectMetadataId: Partial<
    Record<string, StoredFormulaRelatedRecordWatchPlan[]>
  >;
  // Every object holding a stored formula has an entry, even when its formulas read none of its own fields
  watchedOwnFieldNamesByObjectMetadataId: Partial<
    Record<string, ReadonlySet<string>>
  >;
};
