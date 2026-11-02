import { describe, expect, it } from 'vitest';

import { CallRecorderRecordMyMeetingsChoice } from 'src/constants/call-recorder-record-my-meetings-choice';
import { isRecordingRequestedByAttendee } from 'src/logic-functions/domain/is-recording-requested-by-attendee.util';

const { ALL_MEETINGS, EXTERNAL_MEETINGS, NONE } =
  CallRecorderRecordMyMeetingsChoice;

describe('isRecordingRequestedByAttendee', () => {
  it('is true when no attendee matches a workspace member', () => {
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: [],
        hasExternalAttendee: true,
        recordMyMeetingsChoices: new Map(),
      }),
    ).toBe(true);
  });

  it('records only external meetings for a member with the default choice', () => {
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: ['member-1'],
        hasExternalAttendee: true,
        recordMyMeetingsChoices: new Map(),
      }),
    ).toBe(true);
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: ['member-1'],
        hasExternalAttendee: false,
        recordMyMeetingsChoices: new Map(),
      }),
    ).toBe(false);
  });

  it('skips an internal meeting unless an attendee chose all meetings', () => {
    const participantWorkspaceMemberIds = ['member-1', 'member-2'];

    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds,
        hasExternalAttendee: false,
        recordMyMeetingsChoices: new Map([['member-1', EXTERNAL_MEETINGS]]),
      }),
    ).toBe(false);
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds,
        hasExternalAttendee: false,
        recordMyMeetingsChoices: new Map([['member-2', ALL_MEETINGS]]),
      }),
    ).toBe(true);
  });

  it('is false when every matched attendee chose none', () => {
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
        hasExternalAttendee: true,
        recordMyMeetingsChoices: new Map([
          ['member-1', NONE],
          ['member-2', NONE],
        ]),
      }),
    ).toBe(false);
  });

  it('is true when one matched attendee still wants the meeting', () => {
    expect(
      isRecordingRequestedByAttendee({
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
        hasExternalAttendee: true,
        recordMyMeetingsChoices: new Map([
          ['member-1', NONE],
          ['member-2', EXTERNAL_MEETINGS],
        ]),
      }),
    ).toBe(true);
  });
});
