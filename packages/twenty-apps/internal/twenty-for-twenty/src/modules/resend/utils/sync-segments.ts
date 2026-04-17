import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';

import type { SegmentDto } from 'src/modules/resend/types/segment.dto';
import type { SyncResult } from 'src/modules/resend/types/sync-result';
import { fetchAllPaginated } from 'src/modules/resend/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/modules/resend/utils/get-existing-records-map';
import { toIsoString } from 'src/modules/resend/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/utils/upsert-records';

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
