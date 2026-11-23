export type RollupFieldWatchPlan = {
  parentObjectMetadataId: string;
  childJoinColumnName: string;
  watchedFieldNames: string[];
};

export type RollupFieldWatchPlans = {
  watchPlansByChildObjectMetadataId: Partial<
    Record<string, RollupFieldWatchPlan[]>
  >;
  objectMetadataIdsWithRollups: string[];
};
