import { describe, expect, it } from 'vitest';

import { createWeeklyRotationKey } from './create-weekly-rotation-key';

describe('createWeeklyRotationKey', () => {
  it('keeps a partner stable within one UTC week', () => {
    expect(
      createWeeklyRotationKey('partner-1', new Date('2026-08-17T00:00:00Z')),
    ).toBe(
      createWeeklyRotationKey('partner-1', new Date('2026-08-23T23:59:59Z')),
    );
  });

  it('changes at the next UTC Monday', () => {
    expect(
      createWeeklyRotationKey('partner-1', new Date('2026-08-23T23:59:59Z')),
    ).not.toBe(
      createWeeklyRotationKey('partner-1', new Date('2026-08-24T00:00:00Z')),
    );
  });

  it('gives different partners different keys', () => {
    const date = new Date('2026-08-19T12:00:00Z');

    expect(createWeeklyRotationKey('partner-1', date)).not.toBe(
      createWeeklyRotationKey('partner-2', date),
    );
  });
});
