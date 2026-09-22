import { describe, expect, it } from 'vitest';

import { isRecallBotJoinWithinCreditCheckLead } from 'src/logic-functions/domain/is-recall-bot-join-within-credit-check-lead.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('isRecallBotJoinWithinCreditCheckLead', () => {
  it('is within the lead exactly ten minutes before the join', () => {
    expect(
      isRecallBotJoinWithinCreditCheckLead({
        joinAt: '2026-01-01T12:10:00.000Z',
        now: NOW,
      }),
    ).toBe(true);
  });

  it('is outside the lead one millisecond earlier', () => {
    expect(
      isRecallBotJoinWithinCreditCheckLead({
        joinAt: '2026-01-01T12:10:00.001Z',
        now: NOW,
      }),
    ).toBe(false);
  });

  it('is within the lead once the join time has passed', () => {
    expect(
      isRecallBotJoinWithinCreditCheckLead({
        joinAt: '2026-01-01T11:30:00.000Z',
        now: NOW,
      }),
    ).toBe(true);
  });
});
