import { describe, expect, it } from 'vitest';
import { getDueMeetings, getMeetingUrl, matchMeeting } from '../meetings';
import { type Meeting } from '../types';

const NOW = Date.parse('2026-09-07T12:00:10Z');
const MEETING: Meeting = {
  id: 'meeting-1',
  title: 'Design review',
  startsAt: '2026-09-07T12:00:00Z',
  endsAt: '2026-09-07T12:30:00Z',
  url: 'https://meet.google.com/abc-defg-hij',
  recordingEnabled: true,
  usesCalendarBot: true,
};

describe('meeting scheduling', () => {
  it('opens a due meeting once and respects skip across restarts', () => {
    expect(
      getDueMeetings({
        meetings: [MEETING],
        handledIds: new Set(),
        now: NOW,
        lastSyncedAt: NOW,
      }),
    ).toEqual([MEETING]);
    expect(
      getDueMeetings({
        meetings: [MEETING],
        handledIds: new Set([MEETING.id]),
        now: NOW,
        lastSyncedAt: NOW,
      }),
    ).toEqual([]);
  });
  it('does not open old meetings after wake or a stale calendar', () => {
    expect(
      getDueMeetings({
        meetings: [MEETING],
        handledIds: new Set(),
        now: NOW,
        lastSyncedAt: NOW - 91_000,
      }),
    ).toEqual([]);
    expect(
      getDueMeetings({
        meetings: [MEETING],
        handledIds: new Set(),
        now: NOW + 60_000,
        lastSyncedAt: NOW + 60_000,
      }),
    ).toEqual([]);
  });
  it('matches participant-specific join links and duplicate calendar copies', () => {
    expect(
      matchMeeting(
        [MEETING, { ...MEETING, id: 'copy' }],
        `${MEETING.url}?authuser=1`,
        NOW,
      )?.usesCalendarBot,
    ).toBe(true);
    expect(
      matchMeeting([MEETING], MEETING.url ?? undefined, NOW + 3_600_000),
    ).toBeUndefined();
  });
  it('rejects executable, local and credential-bearing meeting links', () => {
    for (const url of [
      'javascript:alert(1)',
      'file:///tmp/a',
      'http://meet.google.com/a',
      'https://user:secret@meet.google.com/a',
    ])
      expect(() => getMeetingUrl(url)).toThrow();
  });
});

it('does not repeatedly auto-join meetings with unsupported links', () => {
  expect(
    getDueMeetings({
      meetings: [{ ...MEETING, url: 'javascript:alert(1)' }],
      handledIds: new Set(),
      now: NOW,
      lastSyncedAt: NOW,
    }),
  ).toEqual([]);
});

it('matches Zoom host aliases but keeps distinct ports separate', () => {
  const zoom = { ...MEETING, url: 'https://www.zoom.us/j/123' };
  expect(matchMeeting([zoom], 'https://zoom.us/j/123', NOW)?.id).toBe(zoom.id);
  expect(
    matchMeeting([zoom], 'https://zoom.us:8443/j/123', NOW),
  ).toBeUndefined();
});
