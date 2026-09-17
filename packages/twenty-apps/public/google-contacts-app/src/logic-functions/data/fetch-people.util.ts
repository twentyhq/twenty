import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryEdgesInBatches } from 'src/logic-functions/data/query-edges-in-batches.util';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

export const fetchPeople = async ({
  client,
  personIds,
}: {
  client: CoreApiClient;
  personIds: string[];
}): Promise<TwentyPersonRecord[]> => {
  return queryEdgesInBatches(personIds, async (batch) => {
    const { people } = await client.query({
      people: {
        __args: { filter: { id: { in: batch } }, first: batch.length },
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
                number: true,
              },
            },
            linkedinLink: { primaryLinkUrl: true },
            company: { name: true },
          },
        },
      },
    });

    return people;
  });
};
