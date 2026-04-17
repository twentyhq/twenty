import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { CreateBroadcastDto } from 'src/modules/resend/sync/types/create-broadcast.dto';
import type { SyncStepResult } from 'src/modules/resend/sync/types/sync-step-result';
import type { UpdateBroadcastDto } from 'src/modules/resend/sync/types/update-broadcast.dto';
import { fetchAllPaginated } from 'src/modules/resend/shared/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/modules/resend/sync/utils/get-existing-records-map';
import type { SegmentIdMap } from 'src/modules/resend/sync/utils/sync-segments';
import { toEmailsField } from 'src/modules/resend/shared/utils/to-emails-field';
import {
  toIsoString,
  toIsoStringOrNull,
} from 'src/modules/resend/shared/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/sync/utils/upsert-records';

export const syncBroadcasts = async (
  resend: Resend,
  client: CoreApiClient,
  segmentMap: SegmentIdMap,
): Promise<SyncStepResult> => {
  const broadcasts = await fetchAllPaginated(
    (params) => resend.broadcasts.list(params),
    'broadcasts',
  );

  const existingMap = await getExistingRecordsMap(client, 'resendBroadcasts');

  const result = await upsertRecords({
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
        fromAddress: toEmailsField(detail.from),
        replyTo: toEmailsField(detail.reply_to),
        previewText: detail.preview_text ?? '',
        status: detail.status.toUpperCase(),
        createdAt: toIsoString(detail.created_at),
        scheduledAt: toIsoStringOrNull(detail.scheduled_at),
        sentAt: toIsoStringOrNull(detail.sent_at),
      };

      if (isDefined(segmentId)) {
        data.segmentId = segmentId;
      }

      return data;
    },
    mapUpdateData: (_detail, broadcast): UpdateBroadcastDto => {
      const data: UpdateBroadcastDto = {
        status: broadcast.status.toUpperCase(),
        scheduledAt: toIsoStringOrNull(broadcast.scheduled_at),
        sentAt: toIsoStringOrNull(broadcast.sent_at),
      };

      if (!isDefined(broadcast.segment_id)) {
        data.segmentId = null;
      } else {
        const segmentId = segmentMap.get(broadcast.segment_id);

        if (isDefined(segmentId)) {
          data.segmentId = segmentId;
        } else {
          console.warn(
            `[sync] broadcast ${broadcast.id}: segment ${broadcast.segment_id} not found in lookup map; leaving segmentId untouched`,
          );
        }
      }

      return data;
    },
    existingMap,
    client,
    objectNameSingular: 'resendBroadcast',
  });

  return { result, value: undefined };
};
