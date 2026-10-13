import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type SseAppliedRecordVersion = {
  record: ObjectRecord;
  updatedAtInMs: number;
  registeredAtInMs: number;
};
