import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { getErrorMessage } from '@modules/resend/shared/utils/get-error-message';
import { extractConnection } from '@modules/resend/shared/utils/typed-client';

type ExistingResendContact = {
  id: string;
  personId?: string | null;
  email?: { primaryEmail?: string | null } | null;
};

export type BackfillResendContactPersonIdResult = {
  updated: number;
  errors: string[];
};

const normalize = (email: string): string => email.trim().toLowerCase();

export const backfillResendContactPersonId = async (
  client: CoreApiClient,
  personIdByEmail: ReadonlyMap<string, string>,
): Promise<BackfillResendContactPersonIdResult> => {
  const result: BackfillResendContactPersonIdResult = {
    updated: 0,
    errors: [],
  };

  const emailKeys = Array.from(personIdByEmail.keys());

  if (emailKeys.length === 0) return result;

  let existingContacts: ExistingResendContact[];

  try {
    const queryResult = await client.query({
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

    existingContacts = extractConnection<ExistingResendContact>(
      queryResult,
      'resendContacts',
    ).edges.map((edge) => edge.node);
  } catch (error) {
    result.errors.push(
      `backfillResendContactPersonId lookup: ${getErrorMessage(error)}`,
    );

    return result;
  }

  for (const contact of existingContacts) {
    if (isDefined(contact.personId)) continue;

    const primaryEmail = contact.email?.primaryEmail;

    if (typeof primaryEmail !== 'string' || primaryEmail.length === 0) continue;

    const personId = personIdByEmail.get(normalize(primaryEmail));

    if (!isDefined(personId)) continue;

    try {
      await client.mutation({
        updateResendContact: {
          __args: {
            id: contact.id,
            data: { personId },
          },
          id: true,
        },
      });

      result.updated++;
    } catch (error) {
      result.errors.push(
        `backfillResendContactPersonId ${contact.id}: ${getErrorMessage(error)}`,
      );
    }
  }

  return result;
};
