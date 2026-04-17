import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import type { ContactDto } from 'src/modules/resend/types/contact.dto';
import type { SyncResult } from 'src/modules/resend/types/sync-result';
import { fetchAllPaginated } from 'src/modules/resend/utils/fetch-all-paginated';
import { findOrCreatePerson } from 'src/modules/resend/utils/find-or-create-person';
import { getExistingRecordsMap } from 'src/modules/resend/utils/get-existing-records-map';
import { toEmailsField } from 'src/modules/resend/utils/to-emails-field';
import { toIsoString } from 'src/modules/resend/utils/to-iso-string';
import { upsertRecords } from 'src/modules/resend/utils/upsert-records';

export const syncContacts = async (
  resend: Resend,
  client: CoreApiClient,
): Promise<SyncResult> => {
  const contacts = await fetchAllPaginated((params) =>
    resend.contacts.list(params),
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
    lastSyncedFromResend: new Date().toISOString(),
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
      const message = error instanceof Error ? error.message : String(error);

      result.errors.push(
        `resendContact ${contact.id} person link: ${message}`,
      );
    }
  }

  return result;
};
