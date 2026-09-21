import { describe, expect, it } from 'vitest';

import { computeRecallBotDetectionActivateAfterSeconds } from 'src/logic-functions/domain/compute-recall-bot-detection-activate-after-seconds.util';

describe('computeRecallBotDetectionActivateAfterSeconds', () => {
  it('activates five minutes after the meeting starts when the bot joins one minute early', () => {
    expect(
      computeRecallBotDetectionActivateAfterSeconds({
        botJoinsAt: '2026-01-01T12:59:00.000Z',
        meetingStartsAt: '2026-01-01T13:00:00.000Z',
      }),
    ).toBe(360);
  });

  it('adds the early-join duration to the grace period', () => {
    expect(
      computeRecallBotDetectionActivateAfterSeconds({
        botJoinsAt: '2026-01-01T12:45:00.000Z',
        meetingStartsAt: '2026-01-01T13:00:00.000Z',
      }),
    ).toBe(1_200);
  });

  it('uses only the grace period when the bot joins after the meeting starts', () => {
    expect(
      computeRecallBotDetectionActivateAfterSeconds({
        botJoinsAt: '2026-01-01T13:05:00.000Z',
        meetingStartsAt: '2026-01-01T13:00:00.000Z',
      }),
    ).toBe(300);
  });
});
