import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchAllPaginated } from 'src/utils/fetch-all-paginated';
import type { SegmentDto } from 'src/types/segment.dto';
import type { SyncResult } from 'src/types/sync-result';
import { getExistingRecordsMap } from 'src/utils/get-existing-records-map';
import { toIsoString } from 'src/utils/to-iso-string';
import { upsertRecords } from 'src/utils/upsert-records';

export const syncSegments = async (
  resend: Resend,
  client: CoreApiClient,
): Promise<{ result: SyncResult; existingMap: Map<string, string> }> => {
  const segments = await fetchAllPaginated((params) =>
    resend.segments.list(params),
  );

  const existingMap = await getExistingRecordsMap(client, 'resendSegments');

  const mapData = (segment: (typeof segments)[number]): SegmentDto => ({
    name: segment.name,
    createdAt: toIsoString(segment.created_at),
    lastSyncedFromResend: new Date().toISOString(),
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

  return { result, existingMap };
};
