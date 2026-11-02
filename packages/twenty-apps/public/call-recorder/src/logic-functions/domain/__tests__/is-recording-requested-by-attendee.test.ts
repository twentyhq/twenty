import { describe, expect, it } from 'vitest';

import { isRecordingRequestedByAttendee } from 'src/logic-functions/domain/is-recording-requested-by-attendee.util';

describe('isRecordingRequestedByAttendee', () => {
  it('is true when no attendee matches a workspace member', () => {
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: [],
        optedInWorkspaceMemberIds: new Set(),
      }),
    ).toBe(true);
  });

  it('is true when any matched attendee is opted in', () => {
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
        optedInWorkspaceMemberIds: new Set(['member-2', 'member-3']),
      }),
    ).toBe(true);
  });

  it('is false when every matched attendee is opted out', () => {
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
        optedInWorkspaceMemberIds: new Set(['member-3']),
      }),
    ).toBe(false);
  });
});
