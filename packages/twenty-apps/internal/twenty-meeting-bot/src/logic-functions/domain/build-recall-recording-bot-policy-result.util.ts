import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { type RecallRecordingBotPolicyCalendarEventInput } from 'src/logic-functions/types/recall-recording-bot-policy-calendar-event-input.type';
import { type RecallRecordingBotPolicyResultForCalendarEvent } from 'src/logic-functions/types/recall-recording-bot-policy-result-for-calendar-event.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { resolveRecallRecordingBotPolicyResult } from 'src/logic-functions/domain/resolve-recall-recording-bot-policy-result.util';

type BuildRecallRecordingBotPolicyResultContext = {
  isRecallRecordingBotEnabledForWorkspace: boolean;
  now: Date;
};

export const buildRecallRecordingBotPolicyResult = (
  calendarEvent: RecallRecordingBotPolicyCalendarEventInput,
  {
    isRecallRecordingBotEnabledForWorkspace,
    now,
  }: BuildRecallRecordingBotPolicyResultContext,
): RecallRecordingBotPolicyResultForCalendarEvent => {
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
  const meetingBotPreference = normalizeRecallRecordingBotPreference(
    calendarEvent.meetingBotPreference,
  );

  const policyResult = resolveRecallRecordingBotPolicyResult({
    input: {
      meetingBotPreference,
      isCanceled: calendarEvent.isCanceled,
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      conferenceLinkUrl: calendarEvent.conferenceLinkUrl,
      hasAutoRecordParticipant,
    },
    now,
    isRecallRecordingBotEnabledForWorkspace,
  });

  return {
    calendarEventId: calendarEvent.id,
    meetingBotPreference,
    realMeetingKey,
    ...policyResult,
  };
};

const normalizeRecallRecordingBotPreference = (
  meetingBotPreference: string | undefined,
): RecallRecordingBotPreference | undefined =>
  isRecallRecordingBotPreference(meetingBotPreference)
    ? meetingBotPreference
    : undefined;

const isRecallRecordingBotPreference = (
  meetingBotPreference: string | undefined,
): meetingBotPreference is RecallRecordingBotPreference =>
  Object.values(RecallRecordingBotPreference).some(
    (preference) => preference === meetingBotPreference,
  );
