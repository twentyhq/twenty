import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { CreateEmailDto } from 'src/modules/resend/types/create-email.dto';
import type { UpdateEmailDto } from 'src/modules/resend/types/update-email.dto';
import type { SyncResult } from 'src/modules/resend/types/sync-result';
import { fetchAllPaginated } from 'src/modules/resend/utils/fetch-all-paginated';
import { findOrCreatePerson } from 'src/modules/resend/utils/find-or-create-person';
import { getExistingRecordsMap } from 'src/modules/resend/utils/get-existing-records-map';
import { toEmailsField } from 'src/modules/resend/utils/to-emails-field';
import { toIsoString, toIsoStringOrNull } from 'src/modules/resend/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/utils/upsert-records';

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

  const result = await upsertRecords({
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
      fromAddress: toEmailsField(detail.from),
      toAddresses: toEmailsField(detail.to),
      htmlBody: detail.html ?? '',
      textBody: detail.text ?? '',
      ccAddresses: toEmailsField(detail.cc),
      bccAddresses: toEmailsField(detail.bcc),
      replyToAddresses: toEmailsField(detail.reply_to),
      lastEvent: mapLastEvent(detail.last_event),
      createdAt: toIsoString(detail.created_at),
      scheduledAt: toIsoStringOrNull(detail.scheduled_at),
      tags: detail.tags,
      lastSyncedFromResend: new Date().toISOString(),
    }),
    mapUpdateData: (_detail, email): UpdateEmailDto => ({
      subject: email.subject,
      fromAddress: toEmailsField(email.from),
      toAddresses: toEmailsField(email.to),
      ccAddresses: toEmailsField(email.cc),
      bccAddresses: toEmailsField(email.bcc),
      replyToAddresses: toEmailsField(email.reply_to),
      lastEvent: mapLastEvent(email.last_event),
      scheduledAt: toIsoStringOrNull(email.scheduled_at),
      lastSyncedFromResend: new Date().toISOString(),
    }),
    existingMap,
    client,
    objectNameSingular: 'resendEmail',
  });

  for (const email of emails) {
    const twentyId = existingMap.get(email.id);

    if (!isDefined(twentyId)) {
      continue;
    }

    const primaryTo = Array.isArray(email.to) ? email.to[0] : email.to;

    try {
      const personId = await findOrCreatePerson(client, primaryTo);

      if (isDefined(personId)) {
        await client.mutation({
          updateResendEmail: {
            __args: { id: twentyId, data: { personId } },
            id: true,
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      result.errors.push(`resendEmail ${email.id} person link: ${message}`);
    }
  }

  return result;
};
