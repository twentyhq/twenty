import { SSE_APPLIED_RECORD_VERSION_TTL_IN_MS } from '@/sse-db-event/constants/SseAppliedRecordVersionTtlInMs';
import { type SseAppliedRecordVersion } from '@/sse-db-event/types/SseAppliedRecordVersion';
import { isDefined } from 'twenty-shared/utils';

export const findNewerSseAppliedRecord = ({
  sseAppliedRecordVersionsByCacheId,
  cacheId,
  updatedAt,
  requestSentAtInMs,
  nowInMs,
}: {
  sseAppliedRecordVersionsByCacheId: Record<string, SseAppliedRecordVersion>;
  cacheId: string;
  updatedAt: string | undefined;
  requestSentAtInMs: number;
  nowInMs: number;
}) => {
  const version = sseAppliedRecordVersionsByCacheId[cacheId];

  if (
    !isDefined(version) ||
    nowInMs - version.registeredAtInMs > SSE_APPLIED_RECORD_VERSION_TTL_IN_MS
  ) {
    return undefined;
  }

  if (!isDefined(updatedAt)) {
    return version.registeredAtInMs > requestSentAtInMs
      ? version.record
      : undefined;
  }

  const updatedAtInMs = Date.parse(updatedAt);

  if (Number.isNaN(updatedAtInMs) || updatedAtInMs >= version.updatedAtInMs) {
    return undefined;
  }

  return version.record;
};
