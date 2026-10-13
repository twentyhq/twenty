import { SSE_APPLIED_RECORD_VERSION_TTL_IN_MS } from '@/sse-db-event/constants/SseAppliedRecordVersionTtlInMs';
import { sseAppliedRecordVersionsByCacheId } from '@/sse-db-event/utils/sseAppliedRecordVersionsByCacheId';

export const pruneExpiredSseAppliedRecordVersions = () => {
  const nowInMs = Date.now();

  for (const [cacheId, version] of sseAppliedRecordVersionsByCacheId) {
    if (
      nowInMs - version.registeredAtInMs <=
      SSE_APPLIED_RECORD_VERSION_TTL_IN_MS
    ) {
      return;
    }

    sseAppliedRecordVersionsByCacheId.delete(cacheId);
  }
};
