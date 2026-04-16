import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';

import type { ContactDto } from 'src/types/contact.dto';
import type { SyncResult } from 'src/types/sync-result';
import { fetchAllPaginated } from 'src/utils/fetch-all-paginated';
import { getExistingRecordsMap } from 'src/utils/get-existing-records-map';
import { upsertRecords } from 'src/utils/upsert-records';

export const syncContacts = async (
  resend: Resend,
  client: CoreApiClient,
): Promise<SyncResult> => {
  const contacts = await fetchAllPaginated((params) =>
    resend.contacts.list(params),
  );

  const existingMap = await getExistingRecordsMap(client, 'resendContacts');

  const mapData = (contact: (typeof contacts)[number]): ContactDto => ({
    email: contact.email,
    firstName: contact.first_name ?? '',
    lastName: contact.last_name ?? '',
    unsubscribed: contact.unsubscribed,
    createdAt: contact.created_at,
  });

  return upsertRecords({
    items: contacts,
    getId: (contact) => contact.id,
    mapCreateData: (_detail, item) => mapData(item),
    mapUpdateData: mapData,
    existingMap,
    client,
    objectNameSingular: 'resendContact',
  });
};
