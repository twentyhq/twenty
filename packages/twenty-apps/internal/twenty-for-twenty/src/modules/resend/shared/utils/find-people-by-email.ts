import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

type PeopleConnection = {
  edges: Array<{
    node: { id: string; emails?: { primaryEmail?: string | null } | null };
  }>;
};

const normalize = (email: string): string => email.trim().toLowerCase();

export const findPeopleByEmail = async (
  client: CoreApiClient,
  emails: ReadonlyArray<string | undefined | null>,
): Promise<Map<string, string>> => {
  const personIdByEmail = new Map<string, string>();

  const emailKeys = Array.from(
    new Set(
      emails
        .filter((email): email is string => isNonEmptyString(email))
        .map(normalize),
    ),
  );

  if (emailKeys.length === 0) return personIdByEmail;

  const { people } = await client.query({
    people: {
      __args: {
        filter: {
          emails: {
            primaryEmail: { in: emailKeys },
          },
        },
        first: emailKeys.length,
      },
      edges: {
        node: {
          id: true,
          emails: { primaryEmail: true },
        },
      },
    },
  });

  for (const edge of (people as PeopleConnection | undefined)?.edges ?? []) {
    const primaryEmail = edge.node.emails?.primaryEmail;

    if (isNonEmptyString(primaryEmail)) {
      personIdByEmail.set(normalize(primaryEmail), edge.node.id);
    }
  }

  return personIdByEmail;
};
