import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { type CallRecorderPolicyCalendarEventInput } from 'src/logic-functions/types/call-recorder-policy-calendar-event-input.type';
import { type CallRecorderPolicyResultForCalendarEvent } from 'src/logic-functions/types/call-recorder-policy-result-for-calendar-event.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { resolveCallRecorderPolicyResult } from 'src/logic-functions/domain/resolve-call-recorder-policy-result.util';

export const buildCallRecorderPolicyResult = (
  calendarEvent: CallRecorderPolicyCalendarEventInput,
  now: Date,
): CallRecorderPolicyResultForCalendarEvent => {
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
      callRecorderPreference,
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
