import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { CreateEmailDto } from 'src/types/create-email.dto';
import type { UpdateEmailDto } from 'src/types/update-email.dto';
import type { SyncResult } from 'src/types/sync-result';
import { fetchAllPaginated } from 'src/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/utils/get-existing-records-map';
import { upsertRecords } from 'src/utils/upsert-records';

const VALID_LAST_EVENTS = new Set([
  'SENT',
  'DELIVERED',
  'DELIVERY_DELAYED',
  'COMPLAINED',
  'BOUNCED',
  'OPENED',
  'CLICKED',
]);

const mapLastEvent = (lastEvent: string): string => {
  const mapped = lastEvent.replace('email.', '').toUpperCase();

  return VALID_LAST_EVENTS.has(mapped) ? mapped : 'SENT';
};

export const syncEmails = async (
  resend: Resend,
  client: CoreApiClient,
): Promise<SyncResult> => {
  const emails = await fetchAllPaginated((params) =>
    resend.emails.list(params),
  );

  const existingMap = await getExistingRecordsMap(client, 'resendEmails');

  return upsertRecords({
    items: emails,
    getId: (email) => email.id,
    fetchDetail: async (id) => {
      const { data: detail, error } = await resend.emails.get(id);

      if (isDefined(error) || !isDefined(detail)) {
        throw new Error(
          `Failed to fetch email ${id}: ${JSON.stringify(error)}`,
        );
      }

      return detail;
    },
    mapCreateData: (detail): CreateEmailDto => ({
      subject: detail.subject,
      fromAddress: detail.from,
      toAddresses: detail.to,
      htmlBody: detail.html ?? '',
      textBody: detail.text ?? '',
      ccAddresses: detail.cc ?? [],
      bccAddresses: detail.bcc ?? [],
      replyToAddresses: detail.reply_to ?? [],
      lastEvent: mapLastEvent(detail.last_event),
      createdAt: detail.created_at,
      scheduledAt: detail.scheduled_at,
      tags: detail.tags,
    }),
    mapUpdateData: (email): UpdateEmailDto => ({
      subject: email.subject,
      fromAddress: email.from,
      toAddresses: email.to,
      ccAddresses: email.cc ?? [],
      bccAddresses: email.bcc ?? [],
      replyToAddresses: email.reply_to ?? [],
      lastEvent: mapLastEvent(email.last_event),
      scheduledAt: email.scheduled_at,
    }),
    existingMap,
    client,
    objectNameSingular: 'resendEmail',
  });
};
