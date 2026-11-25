import { isString } from '@sniptt/guards';
import { randomUUID } from 'node:crypto';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_KV_KEY_PREFIXES } from 'src/constants/line-kv-key-prefixes.constant';
import { wait } from 'src/logic-functions/data/wait.util';

const PERSON_CLAIM_SETTLE_MS = 1_000;
const PERSON_CLAIM_POLL_INTERVAL_MS = 500;
// a claim older than this belongs to a job that died before creating the person
const PERSON_CLAIM_EXPIRY_MS = 20_000;

type PersonClaim = { claimId: string; claimedAt: number };

// LINE user ids differ between LINE providers, so they are only unique per bot
const buildPersonKey = ({
  botUserId,
  userId,
}: {
  botUserId: string;
  userId: string;
}) => `${LINE_KV_KEY_PREFIXES.personIdByLineUserId}${botUserId}:${userId}`;

const personExists = async (client: CoreApiClient, personId: string) => {
  const { people } = await client.query({
    people: {
      __args: { filter: { id: { eq: personId } }, first: 1 },
      edges: { node: { id: true } },
    },
  });

  return (people?.edges.length ?? 0) > 0;
};

// the first job to claim the user creates the person; jobs handling the customer's other first messages wait for it
export const findOrCreateLinePersonId = async ({
  client,
  botUserId,
  userId,
  resolveDisplayName,
}: {
  client: CoreApiClient;
  botUserId: string;
  userId: string;
  resolveDisplayName: () => Promise<string | undefined>;
}): Promise<string> => {
  const personKey = buildPersonKey({ botUserId, userId });
  const claimId = randomUUID();
  const deadline = Date.now() + 2 * PERSON_CLAIM_EXPIRY_MS;

  while (Date.now() < deadline) {
    const entry = await kv.get<string | PersonClaim>(personKey);
    const claim = isString(entry) ? undefined : (entry ?? undefined);

    // the person may have been deleted or merged since
    if (isString(entry) && (await personExists(client, entry))) {
      return entry;
    }

    if (claim?.claimId === claimId) {
      const displayName = await resolveDisplayName();
      const name = isDefined(displayName)
        ? { firstName: displayName, lastName: '' }
        : { firstName: 'LINE user', lastName: userId.slice(-4) };
      const { createPerson } = await client.mutation({
        createPerson: { __args: { data: { name } }, id: true },
      });

      await kv.set(personKey, createPerson.id);

      return createPerson.id;
    }

    if (
      isDefined(claim) &&
      Date.now() - claim.claimedAt < PERSON_CLAIM_EXPIRY_MS
    ) {
      await wait(PERSON_CLAIM_POLL_INTERVAL_MS);

      continue;
    }

    await kv.set<PersonClaim>(personKey, { claimId, claimedAt: Date.now() });
    // parallel jobs may claim at the same moment; the last claim written wins
    await wait(PERSON_CLAIM_SETTLE_MS);
  }

  throw new Error(
    `Timed out waiting for the person of LINE user ${userId} to be created`,
  );
};
