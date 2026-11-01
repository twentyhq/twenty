import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import {
  inspectSessionOperation,
  recoverTerminalSessionOperation,
} from '../inspect-session-operation.ts';
const sessionId = 'b3d78540-15b6-4b9c-b31b-5d663ee06012';
const membershipId = 'f4071e4f-93a5-49be-afcd-3d319c116eb7';
const owner = '{"executionId":"secret-owner"}';
const key = 'edit-session:abc';
const harness = () => {
  const operation = {
    id: sessionId,
    operationKey: key,
    classSessionId: sessionId,
    request: JSON.stringify({
      command: { classSessionId: sessionId },
      membershipIds: [membershipId],
    }),
    state: 'SUCCEEDED',
    ownerToken: owner,
    result: JSON.stringify({
      success: true,
      duplicate: false,
      classSessionId: sessionId,
    }),
  };
  const state = {
    sessionToken: owner as string | null,
    membershipToken: owner as string | null,
    mutations: 0,
    loseReply: false,
    failAfterRelease: false,
    replaceBeforeRelease: false,
    reads: 0,
  };
  const client = {
    async query(selection: Record<string, unknown>) {
      if (state.failAfterRelease && state.mutations > 0)
        throw Error('unavailable');
      if ('studioSessionOperations' in selection)
        return {
          studioSessionOperations: {
            edges: [{ node: { ...operation } }],
            pageInfo: { hasNextPage: false },
          },
        };
      if ('studioMemberships' in selection) {
        state.reads++;
        return {
          studioMemberships: {
            edges: [
              {
                node: { id: membershipId, mutationLock: state.membershipToken },
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
                id: sessionId,
                status: 'PLANNED',
                mutationLock: state.sessionToken,
              },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      };
    },
    async mutation(
      selection: Record<
        string,
        {
          __args: {
            filter: { and: Record<string, { eq: string }>[] };
            data: { mutationLock: null };
          };
        }
      >,
    ) {
      const name = Object.keys(selection)[0];
      const expected = selection[name].__args.filter.and[1].mutationLock.eq;
      assert.equal(expected, owner);
      assert.deepEqual(selection[name].__args.data, { mutationLock: null });
      state.mutations++;
      if (state.replaceBeforeRelease) state.membershipToken = 'new-owner';
      const membership = name === 'updateStudioMemberships';
      const matches =
        (membership ? state.membershipToken : state.sessionToken) === expected;
      if (matches) {
        if (membership) state.membershipToken = null;
        else state.sessionToken = null;
      }
      if (state.loseReply) throw Error('lost reply');
      return {
        [name]: matches
          ? [
              {
                id: membership ? membershipId : sessionId,
                status: 'PLANNED',
                mutationLock: null,
              },
            ]
          : [],
      };
    },
  } as unknown as CoreApiClient;
  const fingerprint = async () => {
    const result = await inspectSessionOperation(client, key);
    if (result.status !== 'inspected') throw Error('Unavailable');
    return result.snapshot;
  };
  return { client, state, operation, fingerprint };
};
test('terminal recovery includes all owners in snapshot and releases memberships before session without journal changes', async () => {
  const fixture = harness();
  const inspected = await inspectSessionOperation(fixture.client, key);
  if (inspected.status !== 'inspected') throw Error('Unavailable');
  assert.deepEqual(inspected.memberships, [
    { id: membershipId, ownership: 'same-owner' },
  ]);
  assert.doesNotMatch(JSON.stringify(inspected), /secret-owner/);
  assert.equal(fixture.state.reads, 2);
  const original = JSON.stringify(fixture.operation);
  assert.deepEqual(
    await recoverTerminalSessionOperation(
      fixture.client,
      key,
      inspected.snapshot,
    ),
    { status: 'released' },
  );
  assert.equal(fixture.state.mutations, 2);
  assert.equal(fixture.state.sessionToken, null);
  assert.equal(fixture.state.membershipToken, null);
  assert.equal(JSON.stringify(fixture.operation), original);
});
test('changed membership invalidates fingerprint before any release', async () => {
  const fixture = harness();
  const snapshot = await fixture.fingerprint();
  fixture.state.membershipToken = 'new-owner';
  assert.deepEqual(
    await recoverTerminalSessionOperation(fixture.client, key, snapshot),
    { status: 'snapshot-mismatch' },
  );
  assert.equal(fixture.state.mutations, 0);
});
test('nonterminal operations and invalid receipts never release with a fresh snapshot', async () => {
  for (const state of ['EXECUTING', 'CLAIMED', 'NEEDS_REVIEW', 'PREPARED']) {
    const fixture = harness();
    fixture.operation.state = state;
    assert.deepEqual(
      await recoverTerminalSessionOperation(
        fixture.client,
        key,
        await fixture.fingerprint(),
      ),
      { status: 'manual-review-required' },
    );
    assert.equal(fixture.state.mutations, 0);
  }
  const fixture = harness();
  fixture.operation.result = '{}';
  assert.deepEqual(
    await recoverTerminalSessionOperation(
      fixture.client,
      key,
      await fixture.fingerprint(),
    ),
    { status: 'manual-review-required' },
  );
  assert.equal(fixture.state.mutations, 0);
});
test('legacy requests with unknown membership scope remain manual review', async () => {
  const fixture = harness();
  fixture.operation.request = JSON.stringify({ classSessionId: sessionId });
  assert.deepEqual(
    await recoverTerminalSessionOperation(
      fixture.client,
      key,
      await fixture.fingerprint(),
    ),
    { status: 'manual-review-required' },
  );
  assert.equal(fixture.state.mutations, 0);
});
test('rejected receipt permits exact-owner recovery', async () => {
  const fixture = harness();
  fixture.operation.state = 'REJECTED';
  fixture.operation.result = JSON.stringify({
    success: false,
    code: 'NO_CAPACITY',
    message: 'Full',
    status: 409,
  });
  assert.deepEqual(
    await recoverTerminalSessionOperation(
      fixture.client,
      key,
      await fixture.fingerprint(),
    ),
    { status: 'released' },
  );
});
test('lost release reply is reconciled by ownership read', async () => {
  const fixture = harness();
  fixture.state.loseReply = true;
  assert.deepEqual(
    await recoverTerminalSessionOperation(
      fixture.client,
      key,
      await fixture.fingerprint(),
    ),
    { status: 'released' },
  );
  assert.equal(fixture.state.mutations, 2);
});
test('unavailable membership confirmation retains session owner', async () => {
  const fixture = harness();
  fixture.state.failAfterRelease = true;
  assert.deepEqual(
    await recoverTerminalSessionOperation(
      fixture.client,
      key,
      await fixture.fingerprint(),
    ),
    { status: 'unconfirmed' },
  );
  assert.equal(fixture.state.sessionToken, owner);
});
test('CAS preserves a replacement owner', async () => {
  const fixture = harness();
  fixture.state.replaceBeforeRelease = true;
  assert.deepEqual(
    await recoverTerminalSessionOperation(
      fixture.client,
      key,
      await fixture.fingerprint(),
    ),
    { status: 'unconfirmed' },
  );
  assert.equal(fixture.state.membershipToken, 'new-owner');
});
