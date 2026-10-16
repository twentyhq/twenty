import assert from 'node:assert/strict';
import test from 'node:test';

import { studioDate } from '../studio-date.ts';

test('uses the Moscow calendar date across UTC midnight and year boundaries', () => {
  assert.equal(studioDate(new Date('2026-10-16T00:00:00+03:00')), '2026-10-16');
  assert.equal(studioDate(new Date('2025-12-31T21:00:00Z')), '2026-01-01');
  assert.equal(studioDate(new Date('2026-10-15T20:59:59Z')), '2026-10-15');
});
