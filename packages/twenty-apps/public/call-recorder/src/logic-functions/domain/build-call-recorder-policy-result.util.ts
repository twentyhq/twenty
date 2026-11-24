import { isDefined } from 'twenty-sdk/utils';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { UNREADABLE_MEMBER_RECORDING_PREFERENCE } from 'src/logic-functions/constants/unreadable-member-recording-preference';
import { type CalendarChannelOwner } from 'src/logic-functions/types/calendar-channel-owner.type';
import { type CallRecorderPolicyCalendarEventInput } from 'src/logic-functions/types/call-recorder-policy-calendar-event-input.type';
import { type CallRecorderPolicyResultForCalendarEvent } from 'src/logic-functions/types/call-recorder-policy-result-for-calendar-event.type';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { isCalendarEventInternal } from 'src/logic-functions/domain/is-calendar-event-internal.util';
import { narrowMemberRecordingPreferenceToCalendarEvent } from 'src/logic-functions/domain/narrow-member-recording-preference-to-calendar-event.util';
import { resolveCallRecorderPolicyResult } from 'src/logic-functions/domain/resolve-call-recorder-policy-result.util';
import { isCalendarBotSchedulingEnabled } from 'src/logic-functions/utils/is-calendar-bot-scheduling-enabled.util';

export const buildCallRecorderPolicyResult = ({
  calendarEvent,
  calendarChannelOwnerByCalendarChannelId,
  memberRecordingPreferenceByUserWorkspaceId,
  now,
}: {
  calendarEvent: CallRecorderPolicyCalendarEventInput;
  calendarChannelOwnerByCalendarChannelId: Map<string, CalendarChannelOwner>;
  memberRecordingPreferenceByUserWorkspaceId: Map<
    string,
    MemberRecordingPreference
  >;
  now: Date;
}): CallRecorderPolicyResultForCalendarEvent => {
  const realMeetingKey = computeRealMeetingKey({
    calendarEventId: calendarEvent.id,
    conferenceLinkUrl: calendarEvent.conferenceLinkUrl,
    iCalUid: calendarEvent.iCalUid,
    startsAt: calendarEvent.startsAt,
  });

  const callRecorderPreference = normalizeCallRecorderPreference(
    calendarEvent.callRecorderPreference,
  );

  const policyResult = resolveCallRecorderPolicyResult({
    input: {
      isCalendarBotSchedulingEnabled: isCalendarBotSchedulingEnabled(),
      callRecorderPreference,
      ownerRecordingPreferences: calendarEvent.calendarChannelIds
        .map((calendarChannelId) =>
          calendarChannelOwnerByCalendarChannelId.get(calendarChannelId),
        )
        .filter(isDefined)
        .map((calendarChannelOwner) =>
          narrowMemberRecordingPreferenceToCalendarEvent({
            memberRecordingPreference:
              memberRecordingPreferenceByUserWorkspaceId.get(
                calendarChannelOwner.userWorkspaceId,
              ) ?? UNREADABLE_MEMBER_RECORDING_PREFERENCE,
            isCalendarEventInternal: isCalendarEventInternal({
              participants: calendarEvent.participants,
              hasUnlistedParticipants: calendarEvent.hasUnlistedParticipants,
              ownerHandle: calendarChannelOwner.handle,
            }),
          }),
        ),
      isCanceled: calendarEvent.isCanceled,
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      conferenceLinkUrl: calendarEvent.conferenceLinkUrl,
    },
    now,
  });

  return {
    calendarEventId: calendarEvent.id,
    callRecorderPreference,
    realMeetingKey,
    ...policyResult,
  };
};

const normalizeCallRecorderPreference = (
  callRecorderPreference: string | undefined,
): CallRecorderPreference | undefined =>
  isCallRecorderPreference(callRecorderPreference)
    ? callRecorderPreference
    : undefined;

const isCallRecorderPreference = (
  callRecorderPreference: string | undefined,
): callRecorderPreference is CallRecorderPreference =>
  Object.values(CallRecorderPreference).some(
    (preference) => preference === callRecorderPreference,
  );
