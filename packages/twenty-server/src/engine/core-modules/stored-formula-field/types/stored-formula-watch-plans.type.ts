// The record to mark dirty is in objectMetadataId; joinColumnName links it to the watched record
export type StoredFormulaRecordWatchPlan = {
  objectMetadataId: string;
  joinColumnName: string;
  watchedFieldNames: ReadonlySet<string>;
};

export type StoredFormulaWatchPlans = {
  // Keyed by the related (child) object, whose join column points to the record to mark
  relatedRecordWatchPlansByObjectMetadataId: Partial<
    Record<string, StoredFormulaRecordWatchPlan[]>
  >;
  // Keyed by the looked-up (parent) object, which the records to mark point to
  lookedUpRecordWatchPlansByObjectMetadataId: Partial<
    Record<string, StoredFormulaRecordWatchPlan[]>
  >;
  // Every object holding a stored formula has an entry, even when its formulas read none of its own fields
  watchedOwnFieldNamesByObjectMetadataId: Partial<
    Record<string, ReadonlySet<string>>
  >;
};
