import { type CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_KV_KEY_PREFIXES } from 'src/constants/messenger-kv-key-prefixes.constant';
import { wait } from 'src/logic-functions/data/wait.util';
import { type PersonName } from 'src/logic-functions/types/person-name.type';

const PERSON_CREATION_SETTLE_MS = 1_000;

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
  resolveName,
}: {
  client: CoreApiClient;
  pageId: string;
  pageScopedId: string;
  resolveName: () => Promise<PersonName | undefined>;
}): Promise<string> => {
  const personKey = buildPersonKey({ pageId, pageScopedId });
  const storedPersonId = await kv.get<string>(personKey);

  // the person may have been deleted or merged since
  if (isDefined(storedPersonId) && (await personExists(client, storedPersonId))) {
    return storedPersonId;
  }

  const name = (await resolveName()) ?? {
    firstName: 'Messenger user',
    lastName: pageScopedId.slice(-4),
  };

  const { createPerson } = await client.mutation({
    createPerson: {
      __args: { data: { name } },
      id: true,
    },
  });

  await kv.set(personKey, createPerson.id);

  // a customer's first messages arrive together and run in parallel; the last id written wins and the others are removed
  await wait(PERSON_CREATION_SETTLE_MS);

  const winningPersonId = await kv.get<string>(personKey);

  if (isDefined(winningPersonId) && winningPersonId !== createPerson.id) {
    await client.mutation({
      deletePerson: { __args: { id: createPerson.id }, id: true },
    });

    return winningPersonId;
  }

  return createPerson.id;
};
