import { describe, expect, it } from 'vitest';

import {
  BROADCAST_EMAIL_MATCH_WINDOW_MS,
  resolveBroadcastIdForEmail,
} from '@modules/resend/sync/utils/resolve-broadcast-id-for-email';

const buildBroadcasts = (
  broadcasts: Array<[string, number]>,
): Array<{ id: string; sentAtMs: number }> =>
  broadcasts
    .map(([id, sentAtMs]) => ({ id, sentAtMs }))
    .sort((left, right) => left.sentAtMs - right.sentAtMs);

describe('resolveBroadcastIdForEmail', () => {
  it('returns undefined when there are no broadcasts', () => {
    expect(resolveBroadcastIdForEmail(Date.now(), [])).toBeUndefined();
  });

  it('returns undefined when emailCreatedAtMs is NaN', () => {
    const broadcasts = buildBroadcasts([['b1', 1_000]]);

    expect(resolveBroadcastIdForEmail(Number.NaN, broadcasts)).toBeUndefined();
  });

  it('picks the closest preceding broadcast within the 1h window', () => {
    const baseSent = new Date('2026-01-01T10:00:00Z').getTime();
    const broadcasts = buildBroadcasts([
      ['old', baseSent - 30 * 60 * 1000],
      ['recent', baseSent],
    ]);
    const emailCreatedAt = baseSent + 5 * 60 * 1000;

    expect(resolveBroadcastIdForEmail(emailCreatedAt, broadcasts)).toBe(
      'recent',
    );
  });

  it('returns undefined when the closest preceding broadcast is outside the 1h window', () => {
    const broadcastSent = new Date('2026-01-01T10:00:00Z').getTime();
    const broadcasts = buildBroadcasts([['too-old', broadcastSent]]);
    const emailCreatedAt = broadcastSent + BROADCAST_EMAIL_MATCH_WINDOW_MS + 1;

    expect(
      resolveBroadcastIdForEmail(emailCreatedAt, broadcasts),
    ).toBeUndefined();
  });

  it('matches broadcasts whose sentAt equals the email createdAt (boundary lower bound)', () => {
    const sentAt = new Date('2026-01-01T10:00:00Z').getTime();
    const broadcasts = buildBroadcasts([['exact', sentAt]]);

    expect(resolveBroadcastIdForEmail(sentAt, broadcasts)).toBe('exact');
  });

  it('matches at the exact 1h upper bound', () => {
    const sentAt = new Date('2026-01-01T10:00:00Z').getTime();
    const broadcasts = buildBroadcasts([['edge', sentAt]]);
    const emailCreatedAt = sentAt + BROADCAST_EMAIL_MATCH_WINDOW_MS;

    expect(resolveBroadcastIdForEmail(emailCreatedAt, broadcasts)).toBe('edge');
  });

  it('ignores broadcasts sent strictly after the email', () => {
    const emailCreatedAt = new Date('2026-01-01T10:00:00Z').getTime();
    const broadcasts = buildBroadcasts([
      ['future', emailCreatedAt + 60 * 1000],
    ]);

    expect(
      resolveBroadcastIdForEmail(emailCreatedAt, broadcasts),
    ).toBeUndefined();
  });

  it('on identical sentAt, picks the broadcast that comes last in the sorted array (deterministic tiebreak)', () => {
    const sentAt = new Date('2026-01-01T10:00:00Z').getTime();
    const broadcasts: Array<{ id: string; sentAtMs: number }> = [
      { id: 'first', sentAtMs: sentAt },
      { id: 'second', sentAtMs: sentAt },
    ];

    expect(resolveBroadcastIdForEmail(sentAt + 60 * 1000, broadcasts)).toBe(
      'second',
    );
  });

  it('skips broadcasts sent after the email and returns the closest preceding one within the window', () => {
    const baseSent = new Date('2026-01-01T10:00:00Z').getTime();
    const broadcasts = buildBroadcasts([
      ['preceding', baseSent],
      ['later', baseSent + 30 * 60 * 1000],
    ]);
    const emailCreatedAt = baseSent + 10 * 60 * 1000;

    expect(resolveBroadcastIdForEmail(emailCreatedAt, broadcasts)).toBe(
      'preceding',
    );
  });
});
