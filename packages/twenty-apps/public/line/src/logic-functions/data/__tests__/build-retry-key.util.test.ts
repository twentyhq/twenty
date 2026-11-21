import { describe, expect, it } from 'vitest';

import { buildRetryKey } from 'src/logic-functions/data/build-retry-key.util';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('buildRetryKey', () => {
  it('builds a hex UUID', () => {
    expect(buildRetryKey('send:1:0')).toMatch(UUID_PATTERN);
  });

  it('gives the same key for the same send', () => {
    expect(buildRetryKey('send:1:0')).toBe(buildRetryKey('send:1:0'));
  });

  it('gives each request of a send its own key', () => {
    expect(buildRetryKey('send:1:0')).not.toBe(buildRetryKey('send:1:1'));
  });
});
