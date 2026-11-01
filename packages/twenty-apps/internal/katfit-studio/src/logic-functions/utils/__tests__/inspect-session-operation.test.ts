import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { inspectSessionOperation } from '../inspect-session-operation.ts';

const classSessionId = 'b3d78540-15b6-4b9c-b31b-5d663ee06012';
const operationKey = 'regular-booking:abc';
const owner = '{"executionId":"private-owner"}';
const operation = {
  id: classSessionId,
  operationKey,
  classSessionId,
  request: JSON.stringify({
    command: { classSessionId, participant: 'one', secret: owner },
    membershipIds: [],
  }),
  state: 'EXECUTING',
  ownerToken: owner,
  result: null as string | null,
};
const fake = (
  options: {
    state?: string;
    token?: string | null;
    changed?: boolean;
    missing?: boolean;
    fail?: boolean;
    result?: string;
  } = {},
) => {
  let reads = 0;
  const client = {
    async query(selection: Record<string, unknown>) {
      if (options.fail) throw Error('network');
      if ('studioSessionOperations' in selection) {
        reads++;
        return {
          studioSessionOperations: {
            edges: options.missing
              ? []
              : [
                  {
                    node: {
                      ...operation,
                      state:
                        options.changed && reads > 1
                          ? 'SUCCEEDED'
                          : (options.state ?? 'EXECUTING'),
                      result: options.result ?? null,
                    },
                  },
                ],
            pageInfo: { hasNextPage: false },
          },
        };
      }
      return {
        classSessions: {
          edges: [
            {
              node: {
                id: classSessionId,
                status: 'PLANNED',
                mutationLock:
                  options.token === undefined ? owner : options.token,
              },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      };
    },
    mutation() {
      throw Error('Inspection must not mutate');
    },
  };
  return client as unknown as CoreApiClient;
};

test('inspection retains frozen command, reports owner consistency and hides raw and JSON-escaped tokens', async () => {
  const result = await inspectSessionOperation(fake(), operationKey);
  assert.equal(result.status, 'inspected');
  if (result.status !== 'inspected') throw Error('Missing inspection');
  assert.equal(result.ownership, 'same-owner');
  assert.equal(result.recovery, 'manual-review-required');
  assert.match(result.snapshot, /^[a-f0-9]{64}$/);
  assert.match(result.frozenRequest, /participant/);
  assert.doesNotMatch(JSON.stringify(result), /private-owner/);
});

test('terminal receipt advises original command replay, never releases directly', async () => {
  const result = await inspectSessionOperation(
    fake({
      state: 'SUCCEEDED',
      result: JSON.stringify({
        success: true,
        duplicate: false,
        bookingId: classSessionId,
      }),
    }),
    operationKey,
  );
  assert.equal(
    result.status === 'inspected' && result.recovery,
    'retry-original-command',
  );
});

test('another execution owner or nonterminal state always requires review', async () => {
  for (const options of [
    { state: 'NEEDS_REVIEW' },
    { state: 'CLAIMED' },
    { state: 'SUCCEEDED', token: 'different' },
  ]) {
    const result = await inspectSessionOperation(fake(options), operationKey);
    assert.equal(
      result.status === 'inspected' && result.recovery,
      'manual-review-required',
    );
  }
});

test('observations changing during inspection cannot become approval snapshots', async () => {
  assert.deepEqual(
    await inspectSessionOperation(fake({ changed: true }), operationKey),
    { status: 'changed-during-inspection' },
  );
});

test('missing operation and unavailable response remain distinguishable', async () => {
  assert.deepEqual(
    await inspectSessionOperation(fake({ missing: true }), operationKey),
    { status: 'not-found' },
  );
  assert.deepEqual(
    await inspectSessionOperation(fake({ fail: true }), operationKey),
    { status: 'unconfirmed' },
  );
});

test('invalid key is rejected without network access', async () => {
  assert.deepEqual(await inspectSessionOperation(fake(), 'bad\nkey'), {
    status: 'unconfirmed',
  });
});

test('terminal state without a valid receipt requires review', async () => {
  for (const state of ['SUCCEEDED', 'REJECTED']) {
    const result = await inspectSessionOperation(fake({ state }), operationKey);
    assert.equal(
      result.status === 'inspected' && result.recovery,
      'manual-review-required',
    );
  }
});
