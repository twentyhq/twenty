import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sseAppliedRecordVersionsByCacheId } from '@/sse-db-event/utils/sseAppliedRecordVersionsByCacheId';
import { isDefined } from 'twenty-shared/utils';

export const findNewerSseAppliedRecord = ({
  cacheId,
  updatedAt,
}: {
  cacheId: string;
  updatedAt: string;
}): ObjectRecord | undefined => {
  const version = sseAppliedRecordVersionsByCacheId.get(cacheId);

  if (!isDefined(version)) {
    return undefined;
  }

  const updatedAtInMs = Date.parse(updatedAt);

  if (Number.isNaN(updatedAtInMs) || updatedAtInMs >= version.updatedAtInMs) {
    return undefined;
  }

  return version.record;
};
