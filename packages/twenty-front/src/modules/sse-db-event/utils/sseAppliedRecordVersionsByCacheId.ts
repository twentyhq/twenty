import { type SseAppliedRecordVersion } from '@/sse-db-event/types/SseAppliedRecordVersion';

export const sseAppliedRecordVersionsByCacheId = new Map<
  string,
  SseAppliedRecordVersion
>();
