import { CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/logic-functions/data/chunk.util';
import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';
import { isTwentyPersonRecord } from 'src/logic-functions/data/is-twenty-person-record.util';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';
import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';

export const fetchPeople = async ({
  client,
  personIds,
}: {
  client: CoreApiClient;
  personIds: string[];
}): Promise<TwentyPersonRecord[]> => {
  const people: TwentyPersonRecord[] = [];

  for (const personIdsBatch of chunk(personIds, BATCH_SIZE)) {
    const { people: peoplePage } = await executeWithRetry(() =>
      client.query({
        people: {
          __args: {
            filter: { id: { in: personIdsBatch } },
            first: personIdsBatch.length,
          },
          edges: {
            node: {
              id: true,
              googleContactsId: true,
              jobTitle: true,
              name: { firstName: true, lastName: true },
              emails: { primaryEmail: true, additionalEmails: true },
              phones: {
                primaryPhoneNumber: true,
                primaryPhoneCallingCode: true,
                additionalPhones: {
                  callingCode: true,
                  countryCode: true,
                  number: true,
                },
              },
              linkedinLink: { primaryLinkUrl: true },
              xLink: { primaryLinkUrl: true },
              company: { name: true },
            },
          },
        },
      }),
    );

    for (const edge of peoplePage?.edges ?? []) {
      if (isTwentyPersonRecord(edge.node)) {
        people.push(edge.node);
      }
    }
  }

  return people;
};
