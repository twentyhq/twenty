import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { extractConnection } from '@modules/resend/shared/utils/typed-client';

export type ResendContactLookup = {
  id: string;
  personId: string | null;
};

type ResendContactNode = {
  id: string;
  personId?: string | null;
  email?: { primaryEmail?: string | null } | null;
};

const normalize = (email: string): string => email.trim().toLowerCase();

export const findResendContactsByEmail = async (
  client: CoreApiClient,
  emails: ReadonlyArray<string | undefined | null>,
): Promise<Map<string, ResendContactLookup>> => {
  const contactByEmail = new Map<string, ResendContactLookup>();

  const emailKeys = Array.from(
    new Set(
      emails
        .filter((email): email is string => isNonEmptyString(email))
        .map(normalize),
    ),
  );

  if (emailKeys.length === 0) return contactByEmail;

  const result = await client.query({
    resendContacts: {
      __args: {
        filter: {
          email: {
            primaryEmail: { in: emailKeys },
          },
        },
        first: emailKeys.length,
      },
      edges: {
        node: {
          id: true,
          personId: true,
          email: { primaryEmail: true },
        },
      },
    },
  });

  const connection = extractConnection<ResendContactNode>(
    result,
    'resendContacts',
  );

  for (const edge of connection.edges) {
    const primaryEmail = edge.node.email?.primaryEmail;

    if (!isNonEmptyString(primaryEmail)) continue;

    contactByEmail.set(normalize(primaryEmail), {
      id: edge.node.id,
      personId: edge.node.personId ?? null,
    });
  }

  return contactByEmail;
};
