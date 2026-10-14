import { SSE_APPLIED_RECORD_VERSION_TTL_IN_MS } from '@/sse-db-event/constants/SseAppliedRecordVersionTtlInMs';
import { SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT } from '@/sse-db-event/constants/SseAppliedRecordVersionsMaxCount';
import { type SseAppliedRecord } from '@/sse-db-event/types/SseAppliedRecord';
import { type SseAppliedRecordVersion } from '@/sse-db-event/types/SseAppliedRecordVersion';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const addSseAppliedRecordVersions = ({
  sseAppliedRecordVersionsByCacheId,
  appliedRecords,
  nowInMs,
}: {
  sseAppliedRecordVersionsByCacheId: Record<string, SseAppliedRecordVersion>;
  appliedRecords: SseAppliedRecord[];
  nowInMs: number;
}) => {
  const unexpiredVersionsByCacheId = Object.fromEntries(
    Object.entries(sseAppliedRecordVersionsByCacheId).filter(
      ([, version]) =>
        nowInMs - version.registeredAtInMs <=
        SSE_APPLIED_RECORD_VERSION_TTL_IN_MS,
    ),
  );

  const appliedVersionsByCacheId = appliedRecords.reduce<
    Record<string, SseAppliedRecordVersion>
  >((versionsByCacheId, { cacheId, record }) => {
    const updatedAtInMs = isNonEmptyString(record.updatedAt)
      ? Date.parse(record.updatedAt)
      : Number.NaN;

    const latestVersion =
      versionsByCacheId[cacheId] ?? unexpiredVersionsByCacheId[cacheId];

    if (
      Number.isNaN(updatedAtInMs) ||
      (isDefined(latestVersion) && latestVersion.updatedAtInMs > updatedAtInMs)
    ) {
      return versionsByCacheId;
    }

    return {
      ...versionsByCacheId,
      [cacheId]: { record, updatedAtInMs, registeredAtInMs: nowInMs },
    };
  }, {});

  return Object.fromEntries(
    Object.entries({
      ...unexpiredVersionsByCacheId,
      ...appliedVersionsByCacheId,
    })
      .sort(
        ([, firstVersion], [, secondVersion]) =>
          firstVersion.registeredAtInMs - secondVersion.registeredAtInMs,
      )
      .slice(-SSE_APPLIED_RECORD_VERSIONS_MAX_COUNT),
  );
};
