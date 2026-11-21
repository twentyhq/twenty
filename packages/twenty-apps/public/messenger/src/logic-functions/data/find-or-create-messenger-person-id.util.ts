import { type CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';

// A PSID is scoped to one Page, so the same customer has a different id on each Page
const buildPersonKey = ({
  pageId,
  pageScopedId,
}: {
  pageId: string;
  pageScopedId: string;
}) =>
  `${MESSENGER_KV_KEY_PREFIXES.personIdByPageScopedId}${pageId}:${pageScopedId}`;

const personExists = async (client: CoreApiClient, personId: string) => {
  const { people } = await client.query({
    people: {
      __args: { filter: { id: { eq: personId } }, first: 1 },
      edges: { node: { id: true } },
    },
  });

  return (people?.edges.length ?? 0) > 0;
};

export const findOrCreateMessengerPersonId = async ({
  client,
  pageId,
  pageScopedId,
}: {
  client: CoreApiClient;
  pageId: string;
  pageScopedId: string;
}): Promise<string> => {
  const personKey = buildPersonKey({ pageId, pageScopedId });
  const storedPersonId = await kv.get<string>(personKey);

  // the person may have been deleted or merged since
  if (isDefined(storedPersonId) && (await personExists(client, storedPersonId))) {
    return storedPersonId;
  }

  // names need Advanced Access to Business Asset User Profile Access, so start with a placeholder
  const { createPerson } = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: {
            firstName: 'Messenger user',
            lastName: pageScopedId.slice(-4),
          },
        },
      },
      id: true,
    },
  });

  await kv.set(personKey, createPerson.id);

  return createPerson.id;
};
