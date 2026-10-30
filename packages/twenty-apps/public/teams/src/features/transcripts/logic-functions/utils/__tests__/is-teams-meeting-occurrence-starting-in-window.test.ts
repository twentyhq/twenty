import { describe, expect, it } from 'vitest';

import { isTeamsMeetingOccurrenceStartingInWindow } from 'src/features/transcripts/logic-functions/utils/is-teams-meeting-occurrence-starting-in-window';

const NEWER_CHUNK = {
  startDateTime: '2026-08-16T00:00:00.000Z',
  endDateTime: '2026-09-15T00:00:00.000Z',
};

const OLDER_CHUNK = {
  startDateTime: '2026-07-17T00:00:00.000Z',
  endDateTime: '2026-08-16T00:00:00.000Z',
};

describe('isTeamsMeetingOccurrenceStartingInWindow', () => {
  it('should give an occurrence spanning a chunk boundary only to the chunk it starts in', () => {
    const occurrence = { startDateTime: '2026-08-15T23:30:00.000Z' };

    expect(
      isTeamsMeetingOccurrenceStartingInWindow({
        occurrence,
        window: OLDER_CHUNK,
      }),
    ).toBe(true);
    expect(
      isTeamsMeetingOccurrenceStartingInWindow({
        occurrence,
        window: NEWER_CHUNK,
      }),
    ).toBe(false);
  });

  it('should include the window start and exclude its end', () => {
    const occurrence = { startDateTime: '2026-08-16T00:00:00.000Z' };

    expect(
      isTeamsMeetingOccurrenceStartingInWindow({
        occurrence,
        window: NEWER_CHUNK,
      }),
    ).toBe(true);
    expect(
      isTeamsMeetingOccurrenceStartingInWindow({
        occurrence,
        window: OLDER_CHUNK,
      }),
    ).toBe(false);
  });
});
