import { SSE_APPLIED_RECORD_VERSION_TTL_IN_MS } from '@/sse-db-event/constants/SseAppliedRecordVersionTtlInMs';
import { SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT } from '@/sse-db-event/constants/SseAppliedRecordVersionsMaxCount';
import { type SseAppliedRecordVersion } from '@/sse-db-event/types/SseAppliedRecordVersion';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const addSseAppliedRecordVersion = ({
  sseAppliedRecordVersionsByCacheId,
  cacheId,
  record,
  nowInMs,
}: {
  sseAppliedRecordVersionsByCacheId: Record<string, SseAppliedRecordVersion>;
  cacheId: string;
  record: Record<string, unknown>;
  nowInMs: number;
}) => {
  const updatedAtInMs = isNonEmptyString(record.updatedAt)
    ? Date.parse(record.updatedAt)
    : Number.NaN;

  const existingVersion = sseAppliedRecordVersionsByCacheId[cacheId];

  if (
    Number.isNaN(updatedAtInMs) ||
    (isDefined(existingVersion) &&
      existingVersion.updatedAtInMs > updatedAtInMs)
  ) {
    return sseAppliedRecordVersionsByCacheId;
  }

  const unexpiredVersionEntries = Object.entries(
    sseAppliedRecordVersionsByCacheId,
  ).filter(
    ([versionCacheId, version]) =>
      versionCacheId !== cacheId &&
      nowInMs - version.registeredAtInMs <=
        SSE_APPLIED_RECORD_VERSION_TTL_IN_MS,
  );

  return Object.fromEntries([
    ...unexpiredVersionEntries.slice(
      -(SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT - 1),
    ),
    [cacheId, { record, updatedAtInMs, registeredAtInMs: nowInMs }],
  ]);
};
