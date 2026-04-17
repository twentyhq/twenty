import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

type PersonName = {
  firstName?: string;
  lastName?: string;
};

type PeopleConnection = {
  edges: Array<{ node: { id: string } }>;
};

export const findOrCreatePerson = async (
  client: CoreApiClient,
  email: string | undefined | null,
  name?: PersonName,
): Promise<string | undefined> => {
  if (!isNonEmptyString(email)) {
    return undefined;
  }

  const { people } = await client.query({
    people: {
      edges: { node: { id: true } },
      __args: {
        filter: {
          emails: {
            primaryEmail: { eq: email },
          },
        },
        first: 1,
      },
    },
  });

  const existingPersonId = (people as PeopleConnection | undefined)?.edges[0]
    ?.node?.id;

  if (isDefined(existingPersonId)) {
    return existingPersonId;
  }

  const { createPerson } = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: {
            firstName: name?.firstName ?? '',
            lastName: name?.lastName ?? '',
          },
          emails: {
            primaryEmail: email,
          },
        },
      },
      id: true,
    },
  });

  return (createPerson as { id: string } | undefined)?.id;
};
