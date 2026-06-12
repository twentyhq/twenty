import { MeetingBotPreference } from 'src/logic-functions/constants/meeting-bot-preference';
import { type MeetingBotPolicyCalendarEventInput } from 'src/logic-functions/types/meeting-bot-policy-calendar-event-input.type';
import { type MeetingBotPolicyResultForCalendarEvent } from 'src/logic-functions/types/meeting-bot-policy-result-for-calendar-event.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { resolveMeetingBotPolicyResult } from 'src/logic-functions/domain/resolve-meeting-bot-policy-result.util';

export const buildMeetingBotPolicyResult = (
  calendarEvent: MeetingBotPolicyCalendarEventInput,
  now: Date,
): MeetingBotPolicyResultForCalendarEvent => {
  const realMeetingKey = computeRealMeetingKey({
    calendarEventId: calendarEvent.id,
    conferenceLinkUrl: calendarEvent.conferenceLinkUrl,
    iCalUid: calendarEvent.iCalUid,
    startsAt: calendarEvent.startsAt,
  });

  const hasAutoRecordParticipant = calendarEvent.calendarEventParticipants.some(
    (participant) =>
      participant.workspaceMemberMeetingBotAutoRecordEnabled === true,
  );
  const meetingBotPreference = normalizeMeetingBotPreference(
    calendarEvent.meetingBotPreference,
  );

  const policyResult = resolveMeetingBotPolicyResult({
    input: {
      meetingBotPreference,
      isCanceled: calendarEvent.isCanceled,
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      conferenceLinkUrl: calendarEvent.conferenceLinkUrl,
      hasAutoRecordParticipant,
    },
    now,
  });

  return {
    calendarEventId: calendarEvent.id,
    meetingBotPreference,
    realMeetingKey,
    ...policyResult,
  };
};

const normalizeMeetingBotPreference = (
  meetingBotPreference: string | undefined,
): MeetingBotPreference | undefined =>
  isMeetingBotPreference(meetingBotPreference)
    ? meetingBotPreference
    : undefined;

const isMeetingBotPreference = (
  meetingBotPreference: string | undefined,
): meetingBotPreference is MeetingBotPreference =>
  Object.values(MeetingBotPreference).some(
    (preference) => preference === meetingBotPreference,
  );
