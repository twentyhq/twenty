import { describe, expect, it } from 'vitest';

import { isWithinRecallBotAutoRecordJoinWindow } from 'src/logic-functions/utils/is-within-recall-bot-auto-record-join-window.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('isWithinRecallBotAutoRecordJoinWindow', () => {
  it('returns true until the grace after start elapses', () => {
    expect(
      isWithinRecallBotAutoRecordJoinWindow({
        startsAt: '2026-01-01T13:00:00.000Z',
        now: NOW,
      }),
    ).toBe(true);
    expect(
      isWithinRecallBotAutoRecordJoinWindow({
        startsAt: '2026-01-01T11:55:00.000Z',
        now: NOW,
      }),
    ).toBe(true);
    expect(
      isWithinRecallBotAutoRecordJoinWindow({
        startsAt: '2026-01-01T11:50:00.000Z',
        now: NOW,
      }),
    ).toBe(true);
  });

  it('returns false once the grace after start has elapsed', () => {
    expect(
      isWithinRecallBotAutoRecordJoinWindow({
        startsAt: '2026-01-01T11:49:59.999Z',
        now: NOW,
      }),
    ).toBe(false);
  });

  it('returns true when startsAt is missing or invalid', () => {
    expect(
      isWithinRecallBotAutoRecordJoinWindow({ startsAt: null, now: NOW }),
    ).toBe(true);
    expect(
      isWithinRecallBotAutoRecordJoinWindow({ startsAt: '', now: NOW }),
    ).toBe(true);
    expect(
      isWithinRecallBotAutoRecordJoinWindow({
        startsAt: 'not-a-date',
        now: NOW,
      }),
    ).toBe(true);
  });
});
