export type SseAppliedRecordVersion = {
  record: Record<string, unknown>;
  updatedAtInMs: number;
  registeredAtInMs: number;
};
