import { isNonEmptyString } from '@sniptt/guards';
import { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-sdk/utils';

import { chunk } from 'src/logic-functions/data/chunk.util';
import { callGoogle } from 'src/logic-functions/data/google-client.util';
import { readPersonResponseError } from 'src/logic-functions/data/read-person-response-error.util';
import {
  type BatchGetContactsResponse,
  type Person,
} from 'src/logic-functions/types/google-response.type';
import { BATCH_SIZE } from "src/constants/batch-sizes.constant";

const EXISTING_CONTACT_PERSON_FIELDS = 'organizations,urls';

export const fetchExistingContacts = async ({
  axiosInstance,
  googleContactsIds,
}: {
  axiosInstance: AxiosInstance;
  googleContactsIds: string[];
}): Promise<Map<string, Person>> => {
  const contactsByRequestedResourceName = new Map<string, Person>();

  for (const idsBatch of chunk(googleContactsIds, BATCH_SIZE)) {
    const searchParams = new URLSearchParams({
      personFields: EXISTING_CONTACT_PERSON_FIELDS,
    });

    for (const googleContactsId of idsBatch) {
      searchParams.append('resourceNames', `people/${googleContactsId}`);
    }

    const googleResponse = await callGoogle(() =>
      axiosInstance.get<BatchGetContactsResponse>(
        `/people:batchGet?${searchParams.toString()}`,
      ),
    );

    for (const personResponse of googleResponse.data.responses ?? []) {
      const requestedResourceName = personResponse.requestedResourceName;

      if (!isNonEmptyString(requestedResourceName)) {
        continue;
      }

      const error = readPersonResponseError(personResponse);
      const contact = personResponse.person;

      if (
        isDefined(error) ||
        !isDefined(contact) ||
        !isNonEmptyString(contact.etag)
      ) {
        console.log(
          '[google-contacts] No usable Google contact',
          requestedResourceName,
          error ?? 'no etag returned',
        );

        continue;
      }

      contactsByRequestedResourceName.set(requestedResourceName, contact);
    }
  }

  return contactsByRequestedResourceName;
};
