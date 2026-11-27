import { describe, expect, it } from 'vitest';

import { isRecallBotBookedJoinAtCurrent } from 'src/logic-functions/domain/is-recall-bot-booked-join-at-current.util';

describe('isRecallBotBookedJoinAtCurrent', () => {
  it('matches the same instant written in a different form', () => {
    expect(
      isRecallBotBookedJoinAtCurrent({
        bookedJoinAt: '2026-01-01T13:59:00+01:00',
        currentJoinAt: '2026-01-01T12:59:00.000Z',
      }),
    ).toBe(true);
  });

  it('does not match a different instant', () => {
    expect(
      isRecallBotBookedJoinAtCurrent({
        bookedJoinAt: '2026-01-01T12:45:00.000Z',
        currentJoinAt: '2026-01-01T12:59:00.000Z',
      }),
    ).toBe(false);
  });

  it('does not match when the booked join time is unknown', () => {
    expect(
      isRecallBotBookedJoinAtCurrent({
        bookedJoinAt: undefined,
        currentJoinAt: '2026-01-01T12:59:00.000Z',
      }),
    ).toBe(false);
  });
});
