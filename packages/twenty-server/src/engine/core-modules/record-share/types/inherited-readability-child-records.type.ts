export type InheritedReadabilityChildRecords = Record<
  string,
  Record<string, unknown>[]
>;

export type InheritedReadabilityChildRecordsCarrier = {
  inheritedReadabilityChildRecords?: InheritedReadabilityChildRecords;
};
