import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

type PersonName = {
  firstName?: string;
  lastName?: string;
};

type PeopleConnection = {
  edges: Array<{ node: { id: string } }>;
};

const isUniqueViolationError = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : typeof error === 'string'
          ? error
          : '';
  const lower = text.toLowerCase();

  return (
    lower.includes('duplicate') ||
    lower.includes('unique constraint') ||
    lower.includes('uniqueness') ||
    lower.includes('already exists') ||
    lower.includes('violates unique')
  );
};

const findPersonByEmail = async (
  client: CoreApiClient,
  email: string,
): Promise<string | undefined> => {
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

  return (people as PeopleConnection | undefined)?.edges[0]?.node?.id;
};

export const findOrCreatePerson = async (
  client: CoreApiClient,
  email: string | undefined | null,
  name?: PersonName,
): Promise<string | undefined> => {
  if (!isNonEmptyString(email)) {
    return undefined;
  }

  const existingPersonId = await findPersonByEmail(client, email);

  if (isDefined(existingPersonId)) {
    return existingPersonId;
  }

  try {
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
  } catch (createError) {
    if (!isUniqueViolationError(createError)) {
      throw createError;
    }

    const raceWinnerId = await findPersonByEmail(client, email);

    if (isDefined(raceWinnerId)) {
      return raceWinnerId;
    }

    throw createError;
  }
};
