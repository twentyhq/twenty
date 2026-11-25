import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findOrCreateLinePersonId } from 'src/logic-functions/data/find-or-create-line-person-id.util';

const { store } = vi.hoisted(() => ({ store: new Map<string, unknown>() }));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      store.set(key, value);
    },
  },
}));
vi.mock('src/logic-functions/data/wait.util', () => ({
  wait: () => new Promise((resolve) => setImmediate(resolve)),
}));

const buildClient = (existingPersonIds: string[]) => {
  let createdCount = 0;
  const createdPersonIds: string[] = [];

  const client = {
    query: vi.fn(async ({ people }) => {
      const personId = people.__args.filter.id.eq;
      const exists =
        existingPersonIds.includes(personId) ||
        createdPersonIds.includes(personId);

      return { people: { edges: exists ? [{ node: { id: personId } }] : [] } };
    }),
    mutation: vi.fn(async () => {
      createdCount += 1;
      const id = `person-${createdCount}`;

      createdPersonIds.push(id);

      return { createPerson: { id } };
    }),
  };

  return { client, createdPersonIds };
};

const findOrCreate = (client: unknown) =>
  findOrCreateLinePersonId({
    client: client as CoreApiClient,
    botUserId: 'bot-1',
    userId: 'user-1234',
    resolveDisplayName: async () => 'Ada',
  });

describe('findOrCreateLinePersonId', () => {
  beforeEach(() => {
    store.clear();
  });

  it('creates one person when the first messages are processed in parallel', async () => {
    const { client, createdPersonIds } = buildClient([]);

    const personIds = await Promise.all([
      findOrCreate(client),
      findOrCreate(client),
      findOrCreate(client),
    ]);

    expect(createdPersonIds).toEqual(['person-1']);
    expect(personIds).toEqual(['person-1', 'person-1', 'person-1']);
  });

  it('returns the stored person when it still exists', async () => {
    store.set('line-person:bot-1:user-1234', 'person-existing');
    const { client, createdPersonIds } = buildClient(['person-existing']);

    expect(await findOrCreate(client)).toBe('person-existing');
    expect(createdPersonIds).toEqual([]);
  });

  it('creates a new person when the stored one was deleted', async () => {
    store.set('line-person:bot-1:user-1234', 'person-deleted');
    const { client } = buildClient([]);

    expect(await findOrCreate(client)).toBe('person-1');
  });

  it('takes over a claim left by a job that died', async () => {
    store.set('line-person:bot-1:user-1234', {
      claimId: 'dead-job',
      claimedAt: Date.now() - 60_000,
    });
    const { client } = buildClient([]);

    expect(await findOrCreate(client)).toBe('person-1');
  });
});
