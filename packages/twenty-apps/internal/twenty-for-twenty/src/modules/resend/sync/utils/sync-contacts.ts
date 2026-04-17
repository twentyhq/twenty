import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { ContactDto } from 'src/modules/resend/sync/types/contact.dto';
import type { SyncStepResult } from 'src/modules/resend/sync/types/sync-step-result';
import { fetchAllPaginated } from 'src/modules/resend/shared/utils/fetch-all-paginated';
import { findOrCreatePerson } from 'src/modules/resend/shared/utils/find-or-create-person';
import { getErrorMessage } from 'src/modules/resend/shared/utils/get-error-message';
import { getExistingRecordsMap } from 'src/modules/resend/sync/utils/get-existing-records-map';
import { toEmailsField } from 'src/modules/resend/shared/utils/to-emails-field';
import { toIsoString } from 'src/modules/resend/shared/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/sync/utils/upsert-records';

export const syncContacts = async (
  resend: Resend,
  client: CoreApiClient,
  syncedAt: string,
): Promise<SyncStepResult> => {
  const contacts = await fetchAllPaginated(
    (params) => resend.contacts.list(params),
    'contacts',
  );

  const existingMap = await getExistingRecordsMap(client, 'resendContacts');

  const mapData = (contact: (typeof contacts)[number]): ContactDto => ({
    email: toEmailsField(contact.email),
    name: {
      firstName: contact.first_name ?? '',
      lastName: contact.last_name ?? '',
    },
    unsubscribed: contact.unsubscribed,
    createdAt: toIsoString(contact.created_at),
    lastSyncedFromResend: syncedAt,
  });

  const result = await upsertRecords({
    items: contacts,
    getId: (contact) => contact.id,
    mapCreateData: (_detail, item) => mapData(item),
    mapUpdateData: (_detail, item) => mapData(item),
    existingMap,
    client,
    objectNameSingular: 'resendContact',
  });

  for (const contact of contacts) {
    const twentyId = existingMap.get(contact.id);

    if (!isDefined(twentyId)) {
      continue;
    }

    try {
      const personId = await findOrCreatePerson(client, contact.email, {
        firstName: contact.first_name ?? '',
        lastName: contact.last_name ?? '',
      });

      if (isDefined(personId)) {
        await client.mutation({
          updateResendContact: {
            __args: { id: twentyId, data: { personId } },
            id: true,
          },
        });
      }
    } catch (error) {
      const message = getErrorMessage(error);

      result.errors.push(
        `resendContact ${contact.id} person link: ${message}`,
      );
    }
  }

  return { result, value: undefined };
};
