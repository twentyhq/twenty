import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { CreateBroadcastDto } from 'src/types/create-broadcast.dto';
import type { UpdateBroadcastDto } from 'src/types/update-broadcast.dto';
import type { SyncResult } from 'src/types/sync-result';
import { fetchAllPaginated } from 'src/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/utils/get-existing-records-map';
import { upsertRecords } from 'src/utils/upsert-records';

export const syncBroadcasts = async (
  resend: Resend,
  client: CoreApiClient,
  segmentMap: Map<string, string>,
): Promise<SyncResult> => {
  const broadcasts = await fetchAllPaginated((params) =>
    resend.broadcasts.list(params),
  );

  const existingMap = await getExistingRecordsMap(client, 'resendBroadcasts');

  return upsertRecords({
    items: broadcasts,
    getId: (broadcast) => broadcast.id,
    fetchDetail: async (id) => {
      const { data: detail, error } = await resend.broadcasts.get(id);

      if (isDefined(error) || !isDefined(detail)) {
        throw new Error(
          `Failed to fetch broadcast ${id}: ${JSON.stringify(error)}`,
        );
      }

      return detail;
    },
    mapCreateData: (detail, broadcast): CreateBroadcastDto => {
      const segmentId = isDefined(broadcast.segment_id)
        ? segmentMap.get(broadcast.segment_id)
        : undefined;

      const data: CreateBroadcastDto = {
        name: detail.name,
        subject: detail.subject,
        fromAddress: detail.from,
        replyTo: detail.reply_to ?? '',
        previewText: detail.preview_text ?? '',
        status: detail.status.toUpperCase(),
        createdAt: detail.created_at,
        scheduledAt: detail.scheduled_at,
        sentAt: detail.sent_at,
      };

      if (isDefined(segmentId)) {
        data.segmentId = segmentId;
      }

      return data;
    },
    mapUpdateData: (broadcast): UpdateBroadcastDto => {
      const segmentId = isDefined(broadcast.segment_id)
        ? segmentMap.get(broadcast.segment_id)
        : undefined;

      const data: UpdateBroadcastDto = {
        status: broadcast.status.toUpperCase(),
        scheduledAt: broadcast.scheduled_at,
        sentAt: broadcast.sent_at,
      };

      if (isDefined(segmentId)) {
        data.segmentId = segmentId;
      }

      return data;
    },
    existingMap,
    client,
    objectNameSingular: 'resendBroadcast',
  });
};
