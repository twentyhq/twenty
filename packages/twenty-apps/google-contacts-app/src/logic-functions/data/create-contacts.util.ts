import { isNonEmptyString } from '@sniptt/guards';
import { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-sdk/utils';

import { chunk } from 'src/logic-functions/data/chunk.util';
import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';
import {
  callGoogleWithoutRetry,
  describeGoogleError,
} from 'src/logic-functions/data/google-client.util';
import { readPersonResponseError } from 'src/logic-functions/data/read-person-response-error.util';
import { WRITTEN_CONTACT_PERSON_FIELDS } from 'src/logic-functions/data/written-contact-person-fields.constant';
import {
  type ContactToCreate,
  type CreatedContact,
} from 'src/logic-functions/types/contact-write.type';
import { type BatchCreateContactsRequest } from 'src/logic-functions/types/google-request.type';
import {
  type BatchCreateContactsResponse,
  type PersonResponse,
} from 'src/logic-functions/types/google-response.type';
import { BATCH_SIZE } from "src/constants/batch-sizes.constant";

export const createContacts = async ({
  axiosInstance,
  contactsToCreate,
}: {
  axiosInstance: AxiosInstance;
  contactsToCreate: ContactToCreate[];
}): Promise<CreatedContact[]> => {
  const createdContacts: CreatedContact[] = [];

  for (const batch of chunk(contactsToCreate, BATCH_SIZE)) {
    const request: BatchCreateContactsRequest = {
      contacts: batch.map(({ contact }) => ({ contactPerson: contact })),
      readMask: WRITTEN_CONTACT_PERSON_FIELDS,
    };

    let createdPeople: PersonResponse[];

    try {
      const googleResponse = await callGoogleWithoutRetry(() =>
        axiosInstance.post<BatchCreateContactsResponse>(
          '/people:batchCreateContacts',
          request,
        ),
      );

      createdPeople = googleResponse.data.createdPeople ?? [];
    } catch (error) {
      if (error instanceof GoogleAuthFailedError) {
        throw error;
      }

      console.error(
        '[google-contacts] Failed to create a batch of contacts',
        describeGoogleError(error),
      );

      continue;
    }

    if (createdPeople.length !== batch.length) {
      console.error('[google-contacts] Unexpected batch create response size', {
        requested: batch.length,
        received: createdPeople.length,
      });

      continue;
    }

    for (const [index, personResponse] of createdPeople.entries()) {
      const error = readPersonResponseError(personResponse);
      const resourceName = personResponse.person?.resourceName;

      if (isDefined(error) || !isNonEmptyString(resourceName)) {
        console.error(
          '[google-contacts] Failed to create a contact',
          batch[index].person.id,
          error ?? 'no resource name returned',
        );

        continue;
      }

      createdContacts.push({ personId: batch[index].person.id, resourceName });
    }
  }

  return createdContacts;
};
