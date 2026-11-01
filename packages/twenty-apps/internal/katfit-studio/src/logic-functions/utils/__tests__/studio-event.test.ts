import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { recordStudioEvent } from '../studio-event.ts';

const input = {
  eventType: 'OPERATION_FAILED' as const,
  outcome: 'FAILURE' as const,
  idempotencyKey: 'operation-key',
  classSessionId: 'session',
  details: 'PRIVATE_DETAILS',
};

test('confirmed audit does not emit a missing-audit error', async (context) => {
  const log = context.mock.method(console, 'error', () => {});
  await recordStudioEvent(input, {
    mutation: async () => ({ createStudioEvent: { id: 'event' } }),
  } as unknown as CoreApiClient);
  assert.equal(log.mock.callCount(), 0);
});

test('failed and unconfirmed audit writes leave safe correlated diagnostics', async (context) => {
  const log = context.mock.method(console, 'error', () => {});
  for (const mutation of [
    async () => {
      throw new Error('PRIVATE_UPSTREAM_SECRET');
    },
    async () => ({}),
  ]) {
    await recordStudioEvent(input, { mutation } as unknown as CoreApiClient);
  }
  assert.equal(log.mock.callCount(), 2);
  for (const call of log.mock.calls) {
    const message = String(call.arguments[0]);
    const event = JSON.parse(message);
    assert.equal(event.event, 'STUDIO_AUDIT_UNCONFIRMED');
    assert.equal(event.idempotencyKey, input.idempotencyKey);
    assert.equal(event.classSessionId, input.classSessionId);
    assert.equal(message.includes('PRIVATE_'), false);
  }
});
