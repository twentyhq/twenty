import { isDefined } from '@utils/is-defined';
import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { findPeopleByEmail } from '@modules/resend/shared/utils/find-people-by-email';
import { findResendContactsByEmail } from '@modules/resend/shared/utils/find-resend-contacts-by-email';
import { forEachPage } from '@modules/resend/shared/utils/for-each-page';
import { mapLastEvent } from '@modules/resend/shared/utils/map-last-event';
import { toEmailsField } from '@modules/resend/shared/utils/to-emails-field';
import {
  toIsoString,
  toIsoStringOrNull,
} from '@modules/resend/shared/utils/to-iso-string';
import { withSyncCursor } from '@modules/resend/sync/cursor/utils/with-sync-cursor';
import type { CreateEmailDto } from '@modules/resend/sync/types/create-email.dto';
import type { SyncResult } from '@modules/resend/sync/types/sync-result';
import type { SyncStepResult } from '@modules/resend/sync/types/sync-step-result';
import type { UpdateEmailDto } from '@modules/resend/sync/types/update-email.dto';
import { backfillResendContactPersonId } from '@modules/resend/sync/utils/backfill-resend-contact-person-id';
import { findRecentSentBroadcasts } from '@modules/resend/sync/utils/find-recent-sent-broadcasts';
import {
  BROADCAST_EMAIL_MATCH_WINDOW_MS,
  resolveBroadcastIdForEmail,
} from '@modules/resend/sync/utils/resolve-broadcast-id-for-email';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';

export type SyncEmailsOptions = {
  stopBeforeCreatedAtMs?: number;
  resumable?: boolean;
  deadlineAtMs?: number;
};

export const syncEmails = async (
  resend: Resend,
  client: CoreApiClient,
  syncedAt: string,
  options?: SyncEmailsOptions,
): Promise<SyncStepResult> => {
  const aggregate: SyncResult = {
    fetched: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  const resumable = options?.resumable ?? true;
  const stopBeforeCreatedAtMs = options?.stopBeforeCreatedAtMs;
  const cutoffTimestampMs = isDefined(stopBeforeCreatedAtMs)
    ? Date.now() - stopBeforeCreatedAtMs
    : undefined;

  const broadcastSinceIso = isDefined(cutoffTimestampMs)
    ? new Date(cutoffTimestampMs - BROADCAST_EMAIL_MATCH_WINDOW_MS).toISOString()
    : new Date(0).toISOString();
  const sortedBroadcasts = await findRecentSentBroadcasts(client, {
    sinceIso: broadcastSinceIso,
  });

  await withSyncCursor(
    client,
    'EMAILS',
    async ({ resumeCursor, onCursorAdvance }) => {
      const { completed } = await forEachPage(
        (paginationParameters) => resend.emails.list(paginationParameters),
        async (pageEmails) => {
          const primaryToByEmail = new Map<string, string>();

          for (const email of pageEmails) {
            const primaryTo = Array.isArray(email.to) ? email.to[0] : email.to;

            if (typeof primaryTo === 'string' && primaryTo.length > 0) {
              primaryToByEmail.set(email.id, primaryTo);
            }
          }

          const primaryEmails = Array.from(primaryToByEmail.values());

          const [personIdByEmail, contactByEmail] = await Promise.all([
            findPeopleByEmail(client, primaryEmails),
            findResendContactsByEmail(client, primaryEmails),
          ]);

          const resolvePersonId = (resendEmailId: string): string | undefined => {
            const primaryTo = primaryToByEmail.get(resendEmailId);

            if (!isDefined(primaryTo)) return undefined;

            return personIdByEmail.get(primaryTo.trim().toLowerCase());
          };

          const resolveContactId = (
            resendEmailId: string,
          ): string | undefined => {
            const primaryTo = primaryToByEmail.get(resendEmailId);

            if (!isDefined(primaryTo)) return undefined;

            return contactByEmail.get(primaryTo.trim().toLowerCase())?.id;
          };

          const resolveBroadcastId = (createdAt: string): string | undefined =>
            resolveBroadcastIdForEmail(
              new Date(createdAt).getTime(),
              sortedBroadcasts,
            );

          const pageOutcome = await upsertRecords({
            items: pageEmails,
            getId: (email) => email.id,
            mapCreateData: (_detail, email): CreateEmailDto => {
              const mappedLastEvent = mapLastEvent(email.last_event);
              const personId = resolvePersonId(email.id);
              const contactId = resolveContactId(email.id);
              const broadcastId = resolveBroadcastId(email.created_at);

              return {
                subject: email.subject,
                fromAddress: toEmailsField(email.from),
                toAddresses: toEmailsField(email.to),
                ccAddresses: toEmailsField(email.cc),
                bccAddresses: toEmailsField(email.bcc),
                replyToAddresses: toEmailsField(email.reply_to),
                ...(isDefined(mappedLastEvent) && {
                  lastEvent: mappedLastEvent,
                }),
                createdAt: toIsoString(email.created_at),
                scheduledAt: toIsoStringOrNull(email.scheduled_at),
                lastSyncedFromResend: syncedAt,
                ...(isDefined(personId) && { personId }),
                ...(isDefined(contactId) && { contactId }),
                ...(isDefined(broadcastId) && { broadcastId }),
              };
            },
            mapUpdateData: (_detail, email): UpdateEmailDto => {
              const mappedLastEvent = mapLastEvent(email.last_event);
              const personId = resolvePersonId(email.id);
              const contactId = resolveContactId(email.id);
              const broadcastId = resolveBroadcastId(email.created_at);

              return {
                subject: email.subject,
                fromAddress: toEmailsField(email.from),
                toAddresses: toEmailsField(email.to),
                ccAddresses: toEmailsField(email.cc),
                bccAddresses: toEmailsField(email.bcc),
                replyToAddresses: toEmailsField(email.reply_to),
                ...(isDefined(mappedLastEvent) && {
                  lastEvent: mappedLastEvent,
                }),
                scheduledAt: toIsoStringOrNull(email.scheduled_at),
                lastSyncedFromResend: syncedAt,
                ...(isDefined(personId) && { personId }),
                ...(isDefined(contactId) && { contactId }),
                ...(isDefined(broadcastId) && { broadcastId }),
              };
            },
            client,
            objectNameSingular: 'resendEmail',
            objectNamePlural: 'resendEmails',
          });

          aggregate.fetched += pageOutcome.result.fetched;
          aggregate.created += pageOutcome.result.created;
          aggregate.updated += pageOutcome.result.updated;
          aggregate.errors.push(...pageOutcome.result.errors);

          const personBackfillForContacts = new Map<string, string>();

          for (const [normalizedEmail, contact] of contactByEmail) {
            if (isDefined(contact.personId)) continue;

            const personId = personIdByEmail.get(normalizedEmail);

            if (isDefined(personId)) {
              personBackfillForContacts.set(normalizedEmail, personId);
            }
          }

          const contactBackfill = await backfillResendContactPersonId(
            client,
            personBackfillForContacts,
          );

          aggregate.errors.push(...contactBackfill.errors);

          const reachedCutoff =
            isDefined(cutoffTimestampMs) &&
            pageEmails.some(
              (email) =>
                new Date(email.created_at).getTime() < cutoffTimestampMs,
            );

          return {
            ok: pageOutcome.ok,
            stop: reachedCutoff,
            errors: pageOutcome.result.errors,
          };
        },
        'emails',
        {
          startCursor: resumable ? resumeCursor : undefined,
          ...(resumable && { onCursorAdvance }),
          ...(isDefined(options?.deadlineAtMs) && {
            deadlineAtMs: options.deadlineAtMs,
          }),
        },
      );

      return { value: undefined, completed: resumable ? completed : true };
    },
    { preserveCursor: !resumable },
  );

  return { result: aggregate, value: undefined };
};
