import { describe, expect, it } from 'vitest';

import { isRecallBotJoinWithinSettingsUpdateCutoff } from 'src/logic-functions/domain/is-recall-bot-join-within-settings-update-cutoff.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('isRecallBotJoinWithinSettingsUpdateCutoff', () => {
  it('is within the cutoff exactly ten minutes before the join', () => {
    expect(
      isRecallBotJoinWithinSettingsUpdateCutoff({
        joinAt: '2026-01-01T12:10:00.000Z',
        now: NOW,
      }),
    ).toBe(true);
  });

  it('is outside the cutoff one millisecond earlier', () => {
    expect(
      isRecallBotJoinWithinSettingsUpdateCutoff({
        joinAt: '2026-01-01T12:10:00.001Z',
        now: NOW,
      }),
    ).toBe(false);
  });

  it('is outside the cutoff fifteen minutes before the join', () => {
    expect(
      isRecallBotJoinWithinSettingsUpdateCutoff({
        joinAt: '2026-01-01T12:15:00.000Z',
        now: NOW,
      }),
    ).toBe(false);
  });
});
