import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { type RecallRecordingBotPolicyCalendarEventInput } from 'src/logic-functions/types/recall-recording-bot-policy-calendar-event-input.type';
import { type RecallRecordingBotPolicyResultForCalendarEvent } from 'src/logic-functions/types/recall-recording-bot-policy-result-for-calendar-event.type';
import { computeRealMeetingKey } from 'src/logic-functions/utils/compute-real-meeting-key.util';
import { resolveRecallRecordingBotPolicyResult } from 'src/logic-functions/utils/resolve-recall-recording-bot-policy-result.util';

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
  const conferenceLinkUrl =
    calendarEvent.conferenceLink?.primaryLinkUrl ?? null;

  const realMeetingKey = computeRealMeetingKey({
    calendarEventId: calendarEvent.id,
    conferenceLinkUrl,
    iCalUid: calendarEvent.iCalUid,
    startsAt: calendarEvent.startsAt,
  });

  const hasExternalParticipant = (
    calendarEvent.calendarEventParticipants ?? []
  ).some(
    (participant) =>
      participant.workspaceMemberId === null ||
      participant.workspaceMemberId === undefined,
  );
  const recallRecordingBotPreference = normalizeRecallRecordingBotPreference(
    calendarEvent.recallRecordingBotPreference,
  );

  const policyResult = resolveRecallRecordingBotPolicyResult({
    input: {
      recallRecordingBotPreference,
      isCanceled: calendarEvent.isCanceled,
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      conferenceLinkUrl,
      hasExternalParticipant,
    },
    now,
    isRecallRecordingBotEnabledForWorkspace,
  });

  return {
    calendarEventId: calendarEvent.id,
    recallRecordingBotPreference,
    realMeetingKey,
    ...policyResult,
  };
};

const normalizeRecallRecordingBotPreference = (
  recallRecordingBotPreference: string | null | undefined,
): RecallRecordingBotPreference =>
  isRecallRecordingBotPreference(recallRecordingBotPreference)
    ? recallRecordingBotPreference
    : RecallRecordingBotPreference.AUTO;

const isRecallRecordingBotPreference = (
  recallRecordingBotPreference: string | null | undefined,
): recallRecordingBotPreference is RecallRecordingBotPreference =>
  Object.values(RecallRecordingBotPreference).some(
    (preference) => preference === recallRecordingBotPreference,
  );
