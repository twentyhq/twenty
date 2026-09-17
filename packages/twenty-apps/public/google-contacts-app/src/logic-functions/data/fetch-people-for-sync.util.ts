import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryEdgesInBatches } from 'src/logic-functions/data/query-edges-in-batches.util';
import { type ExistingTwentyPerson } from 'src/logic-functions/types/twenty-person.type';

type PersonWithPrimaryEmail = ExistingTwentyPerson & {
  emails?: { primaryEmail?: string | null } | null;
};

export type ExistingTwentyPeople = {
  byGoogleContactsId: Map<string, ExistingTwentyPerson>;
  byPrimaryEmail: Map<string, ExistingTwentyPerson>;
};

const buildEmailVariants = (primaryEmails: string[]): string[] => [
  ...new Set(primaryEmails.flatMap((email) => [email, email.toLowerCase()])),
];

export const fetchPeopleForSync = async ({
  client,
  googleContactsIds,
  primaryEmails,
}: {
  client: CoreApiClient;
  googleContactsIds: string[];
  primaryEmails: string[];
}): Promise<ExistingTwentyPeople> => {
  const byGoogleContactsId = new Map<string, ExistingTwentyPerson>();
  const byPrimaryEmail = new Map<string, ExistingTwentyPerson>();

  const linkedPeople = await queryEdgesInBatches<string, ExistingTwentyPerson>(
    googleContactsIds,
    async (batch) => {
      const { people } = await client.query({
        people: {
          __args: {
            filter: { googleContactsId: { in: batch } },
            first: batch.length,
          },
          edges: {
            node: { id: true, googleContactsId: true, updatedAt: true },
          },
        },
      });

      return people;
    },
  );

  for (const person of linkedPeople) {
    if (isNonEmptyString(person.googleContactsId)) {
      byGoogleContactsId.set(person.googleContactsId, person);
    }
  }

  const peopleWithPrimaryEmail = await queryEdgesInBatches<
    string,
    PersonWithPrimaryEmail
  >(buildEmailVariants(primaryEmails), async (batch) => {
    const { people } = await client.query({
      people: {
        __args: {
          filter: { emails: { primaryEmail: { in: batch } } },
          first: batch.length,
        },
        edges: {
          node: {
            id: true,
            googleContactsId: true,
            updatedAt: true,
            emails: { primaryEmail: true },
          },
        },
      },
    });

    return people;
  });

  for (const person of peopleWithPrimaryEmail) {
    const primaryEmail = person.emails?.primaryEmail;

    if (isNonEmptyString(primaryEmail)) {
      byPrimaryEmail.set(primaryEmail.toLowerCase(), person);
    }
  }

  return { byGoogleContactsId, byPrimaryEmail };
};
