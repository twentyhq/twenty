import { type CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_KV_KEY_PREFIXES } from 'src/constants/line-kv-key-prefixes.constant';

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
  const storedPersonId = await kv.get<string>(personKey);

  // the person may have been deleted or merged since
  if (isDefined(storedPersonId) && (await personExists(client, storedPersonId))) {
    return storedPersonId;
  }

  const displayName = await resolveDisplayName();
  const name = isDefined(displayName)
    ? { firstName: displayName, lastName: '' }
    : { firstName: 'LINE user', lastName: userId.slice(-4) };

  const { createPerson } = await client.mutation({
    createPerson: {
      __args: { data: { name } },
      id: true,
    },
  });

  await kv.set(personKey, createPerson.id);

  return createPerson.id;
};
