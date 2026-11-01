import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { test } from 'node:test';

import { createIdempotencyKey } from '../create-idempotency-key.ts';

test('uses the native UUID when available', (context) => {
  const expected = '73382c59-f261-4f06-a175-c6f51c95233e';
  context.mock.method(globalThis.crypto, 'randomUUID', () => expected);

  assert.equal(createIdempotencyKey(), expected);
});

test('generates distinct UUIDs in a sandbox without randomUUID', (context) => {
  context.mock.getter(globalThis, 'crypto', () => ({
    getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
  }));

  const keys = Array.from({ length: 100 }, () => createIdempotencyKey());

  for (const key of keys) {
    assert.match(
      key,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  }
  assert.equal(new Set(keys).size, keys.length);
});

test('supports environments without either crypto method', (context) => {
  context.mock.getter(globalThis, 'crypto', () => ({}));

  assert.ok(createIdempotencyKey().length > 0);
});
