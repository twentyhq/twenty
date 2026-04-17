import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { CreateEmailDto } from 'src/modules/resend/sync/types/create-email.dto';
import type { SyncStepResult } from 'src/modules/resend/sync/types/sync-step-result';
import type { UpdateEmailDto } from 'src/modules/resend/sync/types/update-email.dto';
import { fetchAllPaginated } from 'src/modules/resend/shared/utils/fetch-all-paginated';
import { findOrCreatePerson } from 'src/modules/resend/shared/utils/find-or-create-person';
import { getErrorMessage } from 'src/modules/resend/shared/utils/get-error-message';
import { getExistingRecordsMap } from 'src/modules/resend/sync/utils/get-existing-records-map';
import { mapLastEvent } from 'src/modules/resend/shared/utils/map-last-event';
import { toEmailsField } from 'src/modules/resend/shared/utils/to-emails-field';
import {
  toIsoString,
  toIsoStringOrNull,
} from 'src/modules/resend/shared/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/sync/utils/upsert-records';

export const syncEmails = async (
  resend: Resend,
  client: CoreApiClient,
  syncedAt: string,
): Promise<SyncStepResult> => {
  const emails = await fetchAllPaginated(
    (params) => resend.emails.list(params),
    'emails',
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
    mapCreateData: (detail): CreateEmailDto => {
      const mappedLastEvent = mapLastEvent(detail.last_event);

      return {
        subject: detail.subject,
        fromAddress: toEmailsField(detail.from),
        toAddresses: toEmailsField(detail.to),
        htmlBody: detail.html ?? '',
        textBody: detail.text ?? '',
        ccAddresses: toEmailsField(detail.cc),
        bccAddresses: toEmailsField(detail.bcc),
        replyToAddresses: toEmailsField(detail.reply_to),
        ...(isDefined(mappedLastEvent) && { lastEvent: mappedLastEvent }),
        createdAt: toIsoString(detail.created_at),
        scheduledAt: toIsoStringOrNull(detail.scheduled_at),
        tags: detail.tags,
        lastSyncedFromResend: syncedAt,
      };
    },
    mapUpdateData: (_detail, email): UpdateEmailDto => {
      const mappedLastEvent = mapLastEvent(email.last_event);

      return {
        subject: email.subject,
        fromAddress: toEmailsField(email.from),
        toAddresses: toEmailsField(email.to),
        ccAddresses: toEmailsField(email.cc),
        bccAddresses: toEmailsField(email.bcc),
        replyToAddresses: toEmailsField(email.reply_to),
        ...(isDefined(mappedLastEvent) && { lastEvent: mappedLastEvent }),
        scheduledAt: toIsoStringOrNull(email.scheduled_at),
        lastSyncedFromResend: syncedAt,
      };
    },
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
      const message = getErrorMessage(error);

      result.errors.push(`resendEmail ${email.id} person link: ${message}`);
    }
  }

  return { result, value: undefined };
};
