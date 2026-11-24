import { isString } from '@sniptt/guards';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { UNREADABLE_MEMBER_RECORDING_PREFERENCE } from 'src/logic-functions/constants/unreadable-member-recording-preference';
import { type CallRecorderPolicyCalendarEventInput } from 'src/logic-functions/types/call-recorder-policy-calendar-event-input.type';
import { type CallRecorderPolicyResultForCalendarEvent } from 'src/logic-functions/types/call-recorder-policy-result-for-calendar-event.type';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { resolveCallRecorderPolicyResult } from 'src/logic-functions/domain/resolve-call-recorder-policy-result.util';
import { isCalendarBotSchedulingEnabled } from 'src/logic-functions/utils/is-calendar-bot-scheduling-enabled.util';

export const buildCallRecorderPolicyResult = ({
  calendarEvent,
  ownerUserWorkspaceIdByCalendarChannelId,
  memberRecordingPreferenceByUserWorkspaceId,
  now,
}: {
  calendarEvent: CallRecorderPolicyCalendarEventInput;
  ownerUserWorkspaceIdByCalendarChannelId: Map<string, string>;
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
          ownerUserWorkspaceIdByCalendarChannelId.get(calendarChannelId),
        )
        .filter(isString)
        .map(
          (ownerUserWorkspaceId) =>
            memberRecordingPreferenceByUserWorkspaceId.get(
              ownerUserWorkspaceId,
            ) ?? UNREADABLE_MEMBER_RECORDING_PREFERENCE,
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
