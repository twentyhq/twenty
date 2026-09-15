import { CoreApiClient } from 'twenty-client-sdk/core';

import { isTwentyPersonRecord } from 'src/logic-functions/data/is-twenty-person-record.util';
import { queryEdgesInBatches } from 'src/logic-functions/data/query-edges-in-batches.util';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

export const fetchPeople = async ({
  client,
  personIds,
}: {
  client: CoreApiClient;
  personIds: string[];
}): Promise<TwentyPersonRecord[]> => {
  const people = await queryEdgesInBatches(personIds, async (batch) => {
    const { people: peoplePage } = await client.query({
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
    });

    return peoplePage;
  });

  return people.filter(isTwentyPersonRecord);
};
