import { isNonEmptyString } from '@sniptt/guards';
import { type AxiosInstance } from 'axios';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  AppConnectionAuthFailedError,
  getConnection,
  reportConnectionAuthFailure,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createContacts } from 'src/logic-functions/data/create-contacts.util';
import { fetchExistingContacts } from 'src/logic-functions/data/fetch-existing-contacts.util';
import { fetchPeople } from 'src/logic-functions/data/fetch-people.util';
import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';
import {
  createGoogleClient,
  describeGoogleError,
} from 'src/logic-functions/data/google-client.util';
import { linkCreatedContacts } from 'src/logic-functions/data/link-created-contacts.util';
import {
  hasContactContent,
  mapTwentyPerson,
} from 'src/logic-functions/data/map-twenty-person.util';
import { updateContacts } from 'src/logic-functions/data/update-contacts.util';
import {
  type ContactToCreate,
  type ContactToUpdate,
} from 'src/logic-functions/types/contact-write.type';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

const exportPeople = async ({
  axiosInstance,
  client,
  people,
}: {
  axiosInstance: AxiosInstance;
  client: CoreApiClient;
  people: TwentyPersonRecord[];
}): Promise<void> => {
  const existingContacts = await fetchExistingContacts({
    axiosInstance,
    googleContactsIds: people
      .map((person) => person.googleContactsId)
      .filter(isNonEmptyString),
  });

  const contactsToCreate: ContactToCreate[] = [];
  const contactsToUpdate: ContactToUpdate[] = [];

  for (const person of people) {
    const existingContact = isNonEmptyString(person.googleContactsId)
      ? existingContacts.get(`people/${person.googleContactsId}`)
      : undefined;

    if (
      isNonEmptyString(person.googleContactsId) &&
      !isDefined(existingContact)
    ) {
      console.log(
        '[google-contacts] Skipping a person whose Google contact was deleted',
        person.id,
        person.googleContactsId,
      );

      continue;
    }

    const contact = mapTwentyPerson(person, existingContact);

    if (isDefined(existingContact)) {
      contactsToUpdate.push({ person, contact, existingContact });

      continue;
    }

    if (!hasContactContent(contact)) {
      continue;
    }

    contactsToCreate.push({ person, contact });
  }

  const createdContacts = await createContacts({
    axiosInstance,
    contactsToCreate,
  });

  await linkCreatedContacts({ client, createdContacts });

  await updateContacts({ axiosInstance, contactsToUpdate });
};

const handler = async ({
  connectionId,
  recordIds,
}: {
  connectionId: string;
  recordIds: string[];
}) => {
  let accessToken: string;

  try {
    accessToken = (await getConnection(connectionId)).accessToken;
  } catch (error) {
    if (error instanceof AppConnectionAuthFailedError) {
      console.error(
        '[google-contacts] Skipping connection flagged as auth failed',
        connectionId,
      );

      return;
    }

    throw error;
  }

  const client = new CoreApiClient();
  const people = await fetchPeople({ client, personIds: recordIds });
  const axiosInstance = createGoogleClient(accessToken);

  try {
    await exportPeople({ axiosInstance, client, people });

    console.log('[google-contacts] Export finished', connectionId);
  } catch (error) {
    if (error instanceof GoogleAuthFailedError) {
      await reportConnectionAuthFailure({
        connectionId,
        reason: error.message,
      });
    }

    console.error(
      '[google-contacts] Export failed',
      connectionId,
      describeGoogleError(error),
    );

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'export-contacts',
  description:
    'Creates or updates the Google contacts matching the Twenty people the user selected.',
  timeoutSeconds: 900,
  handler,
});
