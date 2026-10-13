import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT } from '@/sse-db-event/constants/SseAppliedRecordVersionsMaxCount';
import { pruneExpiredSseAppliedRecordVersions } from '@/sse-db-event/utils/pruneExpiredSseAppliedRecordVersions';
import { sseAppliedRecordVersionsByCacheId } from '@/sse-db-event/utils/sseAppliedRecordVersionsByCacheId';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const registerSseAppliedRecordVersion = ({
  cacheId,
  record,
}: {
  cacheId: string;
  record: ObjectRecord;
}) => {
  if (!isNonEmptyString(record.updatedAt)) {
    return;
  }

  const updatedAtInMs = Date.parse(record.updatedAt);

  if (Number.isNaN(updatedAtInMs)) {
    return;
  }

  pruneExpiredSseAppliedRecordVersions();

  const existingVersion = sseAppliedRecordVersionsByCacheId.get(cacheId);

  if (
    isDefined(existingVersion) &&
    existingVersion.updatedAtInMs > updatedAtInMs
  ) {
    return;
  }

  sseAppliedRecordVersionsByCacheId.delete(cacheId);
  sseAppliedRecordVersionsByCacheId.set(cacheId, {
    record,
    updatedAtInMs,
    registeredAtInMs: Date.now(),
  });

  if (
    sseAppliedRecordVersionsByCacheId.size >
    SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT
  ) {
    const oldestCacheId = sseAppliedRecordVersionsByCacheId.keys().next().value;

    if (isDefined(oldestCacheId)) {
      sseAppliedRecordVersionsByCacheId.delete(oldestCacheId);
    }
  }
};
