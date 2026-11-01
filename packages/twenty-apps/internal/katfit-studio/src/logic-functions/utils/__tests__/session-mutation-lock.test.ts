import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  acquireSessionMutationLock,
  inspectSessionMutationLock,
  releaseSessionMutationLock,
} from '../session-mutation-lock.ts';

const id = 'b3d78540-15b6-4b9c-b31b-5d663ee06012';
const input = {
  classSessionId: id,
  operationId: 'booking:one',
  kind: 'BOOK' as const,
  request: '{"participant":"one"}',
};
type Selection = {
  updateClassSessions: {
    __args: {
      filter: {
        and: Record<string, { eq?: string; is?: string; in?: string[] }>[];
      };
      data: { mutationLock: string | null };
    };
  };
};
class FakeClient {
  token: string | null = null;
  status = 'PLANNED';
  mutations = 0;
  loseResponse = false;
  failRead = false;
  emptyRead = false;
  async query() {
    if (this.failRead) throw Error('Read unavailable');
    return {
      classSessions: {
        edges: this.emptyRead
          ? []
          : [{ node: { id, status: this.status, mutationLock: this.token } }],
        pageInfo: { hasNextPage: false },
      },
    };
  }
  async mutation(selection: Selection) {
    this.mutations++;
    const args = selection.updateClassSessions.__args;
    const matches = args.filter.and.every((condition) =>
      Object.entries(condition).every(([field, predicate]) => {
        const current =
          field === 'id' ? id : field === 'status' ? this.status : this.token;
        return predicate.is === 'NULL'
          ? current === null
          : predicate.in
            ? predicate.in.includes(String(current))
            : current === predicate.eq;
      }),
    );
    if (matches) this.token = args.data.mutationLock;
    if (this.loseResponse) throw Error('Response lost after mutation');
    return {
      updateClassSessions: matches
        ? [{ id, status: this.status, mutationLock: this.token }]
        : [],
    };
  }
  client() {
    return this as unknown as CoreApiClient;
  }
}

test('serializes competing booking and cancellation claims', async () => {
  const fake = new FakeClient();
  const results = await Promise.all([
    acquireSessionMutationLock(fake.client(), input),
    acquireSessionMutationLock(fake.client(), { ...input, kind: 'CANCEL' }),
  ]);
  assert.equal(
    results.filter((result) => result.status === 'acquired').length,
    1,
  );
  assert.equal(
    results.filter((result) => result.status === 'busy-or-not-editable').length,
    1,
  );
});
test('does not allow a second execution of the same business operation to reenter', async () => {
  const fake = new FakeClient();
  const first = await acquireSessionMutationLock(fake.client(), input);
  assert.equal(first.status, 'acquired');
  assert.equal(
    (await acquireSessionMutationLock(fake.client(), input)).status,
    'busy-or-not-editable',
  );
});
test('recovers a lost claim response by checking the exact execution token', async () => {
  const fake = new FakeClient();
  fake.loseResponse = true;
  const result = await acquireSessionMutationLock(fake.client(), input);
  assert.equal(result.status, 'acquired');
  assert.equal(fake.mutations, 1);
});
test('keeps an uncertain claim locked when inspection is unavailable', async () => {
  const fake = new FakeClient();
  fake.loseResponse = true;
  fake.failRead = true;
  assert.equal(
    (await acquireSessionMutationLock(fake.client(), input)).status,
    'unconfirmed',
  );
  assert.notEqual(fake.token, null);
  assert.equal(fake.mutations, 1);
});
test('only the exact owner can release and permit the next operation', async () => {
  const fake = new FakeClient();
  const acquired = await acquireSessionMutationLock(fake.client(), input);
  assert.equal(acquired.status, 'acquired');
  if (acquired.status !== 'acquired') return;
  assert.equal(
    await releaseSessionMutationLock(fake.client(), {
      ...acquired.lock,
      token: 'another-owner',
    }),
    'not-owner',
  );
  assert.equal(fake.token, acquired.lock.token);
  assert.equal(
    await releaseSessionMutationLock(fake.client(), acquired.lock),
    'released',
  );
  assert.equal(
    (
      await acquireSessionMutationLock(fake.client(), {
        ...input,
        kind: 'CANCEL',
      })
    ).status,
    'acquired',
  );
});
test('recovers a lost release response without issuing another mutation', async () => {
  const fake = new FakeClient();
  const acquired = await acquireSessionMutationLock(fake.client(), input);
  if (acquired.status !== 'acquired') throw Error('Expected claim');
  fake.loseResponse = true;
  assert.equal(
    await releaseSessionMutationLock(fake.client(), acquired.lock),
    'released',
  );
  assert.equal(fake.mutations, 2);
  assert.equal(fake.token, null);
});
test('refuses bookings and cancellations for a completed session', async () => {
  const fake = new FakeClient();
  fake.status = 'COMPLETED';
  assert.equal(
    (await acquireSessionMutationLock(fake.client(), input)).status,
    'busy-or-not-editable',
  );
  assert.equal(
    (
      await acquireSessionMutationLock(fake.client(), {
        ...input,
        kind: 'CANCEL',
      })
    ).status,
    'busy-or-not-editable',
  );
});
test('does not expire or automatically take over an old owner', async () => {
  const fake = new FakeClient();
  fake.token = '{"acquiredAt":"2000-01-01T00:00:00Z"}';
  assert.equal(
    (await acquireSessionMutationLock(fake.client(), input)).status,
    'busy-or-not-editable',
  );
  assert.equal(fake.token, '{"acquiredAt":"2000-01-01T00:00:00Z"}');
});
test('does not claim a missing session or accept incomplete inspection', async () => {
  const fake = new FakeClient();
  fake.emptyRead = true;
  assert.equal(
    (await inspectSessionMutationLock(fake.client(), id)).status,
    'unconfirmed',
  );
});
test('rejects invalid identity without a mutation', async () => {
  const fake = new FakeClient();
  assert.equal(
    (
      await acquireSessionMutationLock(fake.client(), {
        ...input,
        classSessionId: 'invalid',
      })
    ).status,
    'invalid-input',
  );
  assert.equal(fake.mutations, 0);
});

test('does not infer ownership from a malformed mutation or missing lock metadata', async () => {
  const client = {
    mutation: async () => ({
      updateClassSessions: [{ id, status: 'PLANNED' }],
    }),
    query: async () => ({
      classSessions: {
        edges: [{ node: { id, status: 'PLANNED' } }],
        pageInfo: { hasNextPage: false },
      },
    }),
  } as unknown as CoreApiClient;
  assert.equal(
    (await acquireSessionMutationLock(client, input)).status,
    'unconfirmed',
  );
});
test('does not clear an owner after an uncertain release with an unavailable inspection', async () => {
  const fake = new FakeClient();
  const acquired = await acquireSessionMutationLock(fake.client(), input);
  if (acquired.status !== 'acquired') throw Error('Expected claim');
  const client = {
    mutation: async () => {
      throw Error('Not delivered');
    },
    query: async () => {
      throw Error('Unavailable');
    },
  } as unknown as CoreApiClient;
  assert.equal(
    await releaseSessionMutationLock(client, acquired.lock),
    'unconfirmed',
  );
  assert.equal(fake.token, acquired.lock.token);
});
test('keeps a later owner intact when a former owner attempts release', async () => {
  const fake = new FakeClient();
  const first = await acquireSessionMutationLock(fake.client(), input);
  if (first.status !== 'acquired') throw Error('Expected claim');
  await releaseSessionMutationLock(fake.client(), first.lock);
  const second = await acquireSessionMutationLock(fake.client(), {
    ...input,
    operationId: 'cancel:two',
    kind: 'CANCEL',
  });
  if (second.status !== 'acquired') throw Error('Expected second claim');
  assert.equal(
    await releaseSessionMutationLock(fake.client(), first.lock),
    'not-owner',
  );
  assert.equal(fake.token, second.lock.token);
});
