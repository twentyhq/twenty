import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { CreateBroadcastDto } from 'src/modules/resend/types/create-broadcast.dto';
import type { SyncResult } from 'src/modules/resend/types/sync-result';
import type { UpdateBroadcastDto } from 'src/modules/resend/types/update-broadcast.dto';
import { fetchAllPaginated } from 'src/modules/resend/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/modules/resend/utils/get-existing-records-map';
import { toEmailsField } from 'src/modules/resend/utils/to-emails-field';
import { toIsoString, toIsoStringOrNull } from 'src/modules/resend/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/utils/upsert-records';

export const syncBroadcasts = async (
  resend: Resend,
  client: CoreApiClient,
  segmentMap: Map<string, string>,
  templateHtmlMap: Map<string, string>,
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

      const templateId = isDefined(detail.html)
        ? templateHtmlMap.get(detail.html)
        : undefined;

      const data: CreateBroadcastDto = {
        name: detail.name,
        subject: detail.subject,
        fromAddress: toEmailsField(detail.from),
        replyTo: toEmailsField(detail.reply_to),
        previewText: detail.preview_text ?? '',
        status: (detail.status ?? 'UNKNOWN').toUpperCase(),
        createdAt: toIsoString(detail.created_at),
        scheduledAt: toIsoStringOrNull(detail.scheduled_at),
        sentAt: toIsoStringOrNull(detail.sent_at),
      };

      if (isDefined(segmentId)) {
        data.segmentId = segmentId;
      }

      if (isDefined(templateId)) {
        data.templateId = templateId;
      }

      return data;
    },
    mapUpdateData: (detail, broadcast): UpdateBroadcastDto => {
      const segmentId = isDefined(broadcast.segment_id)
        ? segmentMap.get(broadcast.segment_id)
        : undefined;

      const templateId = isDefined(detail.html)
        ? templateHtmlMap.get(detail.html)
        : undefined;

      const data: UpdateBroadcastDto = {
        status: (broadcast.status ?? 'UNKNOWN').toUpperCase(),
        scheduledAt: toIsoStringOrNull(broadcast.scheduled_at),
        sentAt: toIsoStringOrNull(broadcast.sent_at),
      };

      if (isDefined(segmentId)) {
        data.segmentId = segmentId;
      }

      if (isDefined(templateId)) {
        data.templateId = templateId;
      }

      return data;
    },
    existingMap,
    client,
    objectNameSingular: 'resendBroadcast',
  });
};
