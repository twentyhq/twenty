import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';
import { chunk } from 'src/logic-functions/data/chunk.util';
import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';
import { type ExistingTwentyPerson } from 'src/logic-functions/types/twenty-person.type';

export type ExistingTwentyPeople = {
  byGoogleContactsId: Map<string, ExistingTwentyPerson>;
  byPrimaryEmail: Map<string, ExistingTwentyPerson>;
};

// `in` is case-sensitive, so both spellings are asked for: Google hands back
// whatever the contact carries while Twenty may hold it lowercased.
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

  for (const batch of chunk(googleContactsIds, BATCH_SIZE)) {
    const { people } = await executeWithRetry(() =>
      client.query({
        people: {
          __args: {
            filter: { googleContactsId: { in: batch } },
            first: batch.length,
          },
          edges: {
            node: { id: true, googleContactsId: true, updatedAt: true },
          },
        },
      }),
    );

    for (const edge of people?.edges ?? []) {
      if (isNonEmptyString(edge.node.googleContactsId)) {
        byGoogleContactsId.set(edge.node.googleContactsId, edge.node);
      }
    }
  }

  for (const batch of chunk(buildEmailVariants(primaryEmails), BATCH_SIZE)) {
    const { people } = await executeWithRetry(() =>
      client.query({
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
      }),
    );

    for (const edge of people?.edges ?? []) {
      const primaryEmail = edge.node.emails?.primaryEmail;

      if (isNonEmptyString(primaryEmail)) {
        byPrimaryEmail.set(primaryEmail.toLowerCase(), edge.node);
      }
    }
  }

  return { byGoogleContactsId, byPrimaryEmail };
};
