import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import type { ContactDto } from '@modules/resend/sync/types/contact.dto';
import type { SyncResult } from '@modules/resend/sync/types/sync-result';
import type { SyncStepResult } from '@modules/resend/sync/types/sync-step-result';
import { findPeopleByEmail } from '@modules/resend/shared/utils/find-people-by-email';
import { findTwentyIdsByResendId } from '@modules/resend/shared/utils/find-twenty-ids-by-resend-id';
import { forEachPage } from '@modules/resend/shared/utils/for-each-page';
import { getErrorMessage } from '@modules/resend/shared/utils/get-error-message';
import { toEmailsField } from '@modules/resend/shared/utils/to-emails-field';
import { toIsoString } from '@modules/resend/shared/utils/to-iso-string';
import { withRateLimitRetry } from '@modules/resend/shared/utils/with-rate-limit-retry';
import {
  backfillResendEmailsFromContacts,
  type ContactBackfillEntry,
} from '@modules/resend/sync/utils/backfill-resend-emails-from-contacts';
import { upsertRecords } from '@modules/resend/sync/utils/upsert-records';
import { withSyncCursor } from '@modules/resend/sync/cursor/utils/with-sync-cursor';

type RawContact = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  unsubscribed: boolean;
  created_at: string;
};

const toContactDto = (
  contact: RawContact,
  syncedAt: string,
  personId: string | undefined,
  segmentId: string | undefined,
): ContactDto => ({
  email: toEmailsField(contact.email),
  name: {
    firstName: contact.first_name ?? '',
    lastName: contact.last_name ?? '',
  },
  unsubscribed: contact.unsubscribed,
  createdAt: toIsoString(contact.created_at),
  lastSyncedFromResend: syncedAt,
  ...(isDefined(personId) && { personId }),
  ...(isDefined(segmentId) && { segmentId }),
});

const fetchFirstSegmentResendIdsForPage = async (
  resend: Resend,
  pageContacts: ReadonlyArray<RawContact>,
  errors: string[],
): Promise<Map<string, string>> => {
  const firstSegmentByContactId = new Map<string, string>();

  for (const contact of pageContacts) {
    try {
      const { data, error } = await withRateLimitRetry(
        () =>
          resend.contacts.segments.list({
            contactId: contact.id,
            limit: 1,
          }),
        { channel: 'contact-segments' },
      );

      if (isDefined(error)) {
        errors.push(
          `resendContact ${contact.id} segments: ${JSON.stringify(error)}`,
        );
        continue;
      }

      const firstSegmentId = data?.data?.[0]?.id;

      if (typeof firstSegmentId === 'string' && firstSegmentId.length > 0) {
        firstSegmentByContactId.set(contact.id, firstSegmentId);
      }
    } catch (error) {
      errors.push(
        `resendContact ${contact.id} segments: ${getErrorMessage(error)}`,
      );
    }
  }

  return firstSegmentByContactId;
};

export type SyncContactsOptions = {
  deadlineAtMs?: number;
};

export const syncContacts = async (
  resend: Resend,
  client: CoreApiClient,
  syncedAt: string,
  options?: SyncContactsOptions,
): Promise<SyncStepResult> => {
  const aggregate: SyncResult = {
    fetched: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  await withSyncCursor(client, 'CONTACTS', async ({ resumeCursor, onCursorAdvance }) => {
    const { completed } = await forEachPage(
      (paginationParameters) => resend.contacts.list(paginationParameters),
      async (pageContacts) => {
        const firstSegmentByContactId = await fetchFirstSegmentResendIdsForPage(
          resend,
          pageContacts,
          aggregate.errors,
        );

        const uniqueSegmentResendIds = Array.from(
          new Set(firstSegmentByContactId.values()),
        );

        const [personIdByEmail, twentySegmentIdByResendId] = await Promise.all([
          findPeopleByEmail(
            client,
            pageContacts.map((contact) => contact.email),
          ),
          uniqueSegmentResendIds.length > 0
            ? findTwentyIdsByResendId(
                client,
                'resendSegments',
                uniqueSegmentResendIds,
              )
            : Promise.resolve(new Map<string, string>()),
        ]);

        const resolvePersonId = (email: string): string | undefined =>
          personIdByEmail.get(email.trim().toLowerCase());

        const resolveSegmentId = (contactId: string): string | undefined => {
          const segmentResendId = firstSegmentByContactId.get(contactId);

          if (!isDefined(segmentResendId)) return undefined;

          return twentySegmentIdByResendId.get(segmentResendId);
        };

        const pageOutcome = await upsertRecords({
          items: pageContacts,
          getId: (contact) => contact.id,
          mapCreateData: (_detail, item) =>
            toContactDto(
              item,
              syncedAt,
              resolvePersonId(item.email),
              resolveSegmentId(item.id),
            ),
          mapUpdateData: (_detail, item) =>
            toContactDto(
              item,
              syncedAt,
              resolvePersonId(item.email),
              resolveSegmentId(item.id),
            ),
          client,
          objectNameSingular: 'resendContact',
          objectNamePlural: 'resendContacts',
        });

        aggregate.fetched += pageOutcome.result.fetched;
        aggregate.created += pageOutcome.result.created;
        aggregate.updated += pageOutcome.result.updated;
        aggregate.errors.push(...pageOutcome.result.errors);

        const entriesByEmail = new Map<string, ContactBackfillEntry>();

        for (const contact of pageContacts) {
          const twentyContactId = pageOutcome.twentyIdByResendId.get(contact.id);

          if (!isDefined(twentyContactId)) continue;

          const personId = resolvePersonId(contact.email);

          entriesByEmail.set(contact.email.trim().toLowerCase(), {
            contactId: twentyContactId,
            ...(isDefined(personId) && { personId }),
          });
        }

        const emailBackfill = await backfillResendEmailsFromContacts(
          client,
          entriesByEmail,
        );

        aggregate.errors.push(...emailBackfill.errors);

        return { ok: pageOutcome.ok, errors: pageOutcome.result.errors };
      },
      'contacts',
      {
        startCursor: resumeCursor,
        onCursorAdvance,
        ...(isDefined(options?.deadlineAtMs) && {
          deadlineAtMs: options.deadlineAtMs,
        }),
      },
    );

    return { value: undefined, completed };
  });

  return { result: aggregate, value: undefined };
};
