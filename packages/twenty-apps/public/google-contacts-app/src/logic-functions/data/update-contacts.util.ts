import { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-sdk/utils';

import { chunk } from 'src/logic-functions/data/chunk.util';
import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';
import {
  callGoogle,
  describeGoogleError,
} from 'src/logic-functions/data/google-client.util';
import { readPersonResponseError } from 'src/logic-functions/data/read-person-response-error.util';
import { splitContactsByResourceName } from 'src/logic-functions/data/split-contacts-by-resource-name.util';
import {
  TWENTY_OWNED_CONTACT_PERSON_FIELDS,
  WRITTEN_CONTACT_PERSON_FIELDS,
} from 'src/constants/written-contact-person-fields.constant';
import { type ContactToUpdate } from 'src/logic-functions/types/contact-write.type';
import { type BatchUpdateContactsRequest } from 'src/logic-functions/types/google-request.type';
import { type BatchUpdateContactsResponse } from 'src/logic-functions/types/google-response.type';
import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';

export const updateContacts = async ({
  axiosInstance,
  contactsToUpdate,
}: {
  axiosInstance: AxiosInstance;
  contactsToUpdate: ContactToUpdate[];
}): Promise<void> => {
  const { uniqueContacts, collidingContacts } =
    splitContactsByResourceName(contactsToUpdate);

  for (const collidingContact of collidingContacts) {
    console.error(
      '[google-contacts] Skipping a person sharing a Google contact with another one',
      collidingContact.person.id,
      collidingContact.existingContact.resourceName,
    );
  }

  for (const batch of chunk(uniqueContacts, BATCH_SIZE)) {
    const request: BatchUpdateContactsRequest = {
      contacts: Object.fromEntries(
        batch.map(({ contact, existingContact }) => [
          existingContact.resourceName,
          { ...contact, etag: existingContact.etag },
        ]),
      ),
      updateMask: TWENTY_OWNED_CONTACT_PERSON_FIELDS,
      readMask: WRITTEN_CONTACT_PERSON_FIELDS,
    };

    let updateResult: BatchUpdateContactsResponse['updateResult'];

    try {
      const googleResponse = await callGoogle(() =>
        axiosInstance.post<BatchUpdateContactsResponse>(
          '/people:batchUpdateContacts',
          request,
        ),
      );

      updateResult = googleResponse.data.updateResult ?? {};
    } catch (error) {
      if (error instanceof GoogleAuthFailedError) {
        throw error;
      }

      console.error(
        '[google-contacts] Failed to update a batch of contacts',
        describeGoogleError(error),
      );

      continue;
    }

    for (const resourceName of Object.keys(request.contacts)) {
      const error = readPersonResponseError(updateResult[resourceName]);

      if (isDefined(error)) {
        console.error(
          '[google-contacts] Failed to update a contact',
          resourceName,
          error,
        );
      }
    }
  }
};
