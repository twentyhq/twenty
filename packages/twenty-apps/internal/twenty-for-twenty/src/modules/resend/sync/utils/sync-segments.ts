import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';

import type { SegmentDto } from 'src/modules/resend/sync/types/segment.dto';
import type { SyncStepResult } from 'src/modules/resend/sync/types/sync-step-result';
import { fetchAllPaginated } from 'src/modules/resend/shared/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/modules/resend/sync/utils/get-existing-records-map';
import { toIsoString } from 'src/modules/resend/shared/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/sync/utils/upsert-records';

export type SegmentIdMap = Map<string, string>;

export const syncSegments = async (
  resend: Resend,
  client: CoreApiClient,
  syncedAt: string,
): Promise<SyncStepResult<SegmentIdMap>> => {
  const segments = await fetchAllPaginated(
    (params) => resend.segments.list(params),
    'segments',
  );

  const existingMap = await getExistingRecordsMap(client, 'resendSegments');

  const mapData = (segment: (typeof segments)[number]): SegmentDto => ({
    name: segment.name,
    createdAt: toIsoString(segment.created_at),
    lastSyncedFromResend: syncedAt,
  });

  const result = await upsertRecords({
    items: segments,
    getId: (segment) => segment.id,
    mapCreateData: (_detail, item) => mapData(item),
    mapUpdateData: (_detail, item) => mapData(item),
    existingMap,
    client,
    objectNameSingular: 'resendSegment',
  });

  return { result, value: existingMap };
};
