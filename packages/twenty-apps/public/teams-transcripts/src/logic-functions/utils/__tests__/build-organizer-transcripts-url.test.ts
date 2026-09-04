import { describe, expect, it } from 'vitest';

import { buildOrganizerTranscriptsUrl } from 'src/logic-functions/utils/build-organizer-transcripts-url.util';

describe('buildOrganizerTranscriptsUrl', () => {
  it('always passes the organizer as a function parameter', () => {
    expect(buildOrganizerTranscriptsUrl({ organizerUserId: 'user-1' })).toBe(
      "users/user-1/onlineMeetings/getAllTranscripts(meetingOrganizerUserId='user-1')?$top=50",
    );
  });

  it('adds the date window as function parameters', () => {
    expect(
      buildOrganizerTranscriptsUrl({
        organizerUserId: 'user-1',
        startDateTime: '2026-01-01T00:00:00Z',
        endDateTime: '2026-02-01T00:00:00Z',
      }),
    ).toBe(
      "users/user-1/onlineMeetings/getAllTranscripts(meetingOrganizerUserId='user-1',startDateTime=2026-01-01T00:00:00Z,endDateTime=2026-02-01T00:00:00Z)?$top=50",
    );
  });
});
