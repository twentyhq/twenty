import { SSE_APPLIED_RECORD_VERSION_TTL_IN_MS } from '@/sse-db-event/constants/SseAppliedRecordVersionTtlInMs';
import { SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT } from '@/sse-db-event/constants/SseAppliedRecordVersionsMaxCount';
import { type SseAppliedRecordVersion } from '@/sse-db-event/types/SseAppliedRecordVersion';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const addSseAppliedRecordVersions = ({
  sseAppliedRecordVersionsByCacheId,
  appliedRecords,
  nowInMs,
}: {
  sseAppliedRecordVersionsByCacheId: Record<string, SseAppliedRecordVersion>;
  appliedRecords: { cacheId: string; record: Record<string, unknown> }[];
  nowInMs: number;
}) => {
  const versionsByCacheId: Record<string, SseAppliedRecordVersion> =
    Object.fromEntries(
      Object.entries(sseAppliedRecordVersionsByCacheId).filter(
        ([, version]) =>
          nowInMs - version.registeredAtInMs <=
          SSE_APPLIED_RECORD_VERSION_TTL_IN_MS,
      ),
    );

  for (const { cacheId, record } of appliedRecords) {
    const updatedAtInMs = isNonEmptyString(record.updatedAt)
      ? Date.parse(record.updatedAt)
      : Number.NaN;

    const existingVersion = versionsByCacheId[cacheId];

    if (
      Number.isNaN(updatedAtInMs) ||
      (isDefined(existingVersion) &&
        existingVersion.updatedAtInMs > updatedAtInMs)
    ) {
      continue;
    }

    delete versionsByCacheId[cacheId];
    versionsByCacheId[cacheId] = {
      record,
      updatedAtInMs,
      registeredAtInMs: nowInMs,
    };
  }

  return Object.fromEntries(
    Object.entries(versionsByCacheId).slice(
      -SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT,
    ),
  );
};
