import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { type RecallRecordingBotPolicyInput } from 'src/logic-functions/types/recall-recording-bot-policy-input.type';
import { type RecallRecordingBotPolicyNotRequiredReason } from 'src/logic-functions/types/recall-recording-bot-policy-not-required-reason.type';
import { type RecallRecordingBotPolicyRequiredReason } from 'src/logic-functions/types/recall-recording-bot-policy-required-reason.type';
import { type RecallRecordingBotPolicyResult } from 'src/logic-functions/types/recall-recording-bot-policy-result.type';

type ResolveRecallRecordingBotPolicyResultArgs = {
  input: RecallRecordingBotPolicyInput;
  now: Date;
  isRecallRecordingBotEnabledForWorkspace: boolean;
};

export const resolveRecallRecordingBotPolicyResult = ({
  input,
  now,
  isRecallRecordingBotEnabledForWorkspace,
}: ResolveRecallRecordingBotPolicyResultArgs): RecallRecordingBotPolicyResult => {
  if (!isRecallRecordingBotEnabledForWorkspace) {
    return botNotRequired('WORKSPACE_BOT_DISABLED');
  }

  if (input.isCanceled) {
    return botNotRequired('EVENT_CANCELED');
  }

  if (input.meetingBotPreference === RecallRecordingBotPreference.OFF) {
    return botNotRequired('PREFERENCE_OFF');
  }

  if (!hasConferenceLink(input.conferenceLinkUrl)) {
    return botNotRequired('MISSING_CONFERENCE_LINK');
  }

  if (
    !isCalendarEventInFuture({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      now,
    })
  ) {
    return botNotRequired('EVENT_NOT_UPCOMING');
  }

  if (input.meetingBotPreference === RecallRecordingBotPreference.ON) {
    return botRequired('PREFERENCE_ON');
  }

  if (input.hasAutoRecordParticipant) {
    return botRequired('MEMBER_AUTO_RECORD');
  }

  return botNotRequired('NO_MEMBER_AUTO_RECORD');
};

const hasConferenceLink = (conferenceLinkUrl: string | null): boolean =>
  conferenceLinkUrl !== null && conferenceLinkUrl.trim() !== '';

const isCalendarEventInFuture = ({
  startsAt,
  endsAt,
  now,
}: {
  startsAt: string | null;
  endsAt: string | null;
  now: Date;
}): boolean => {
  const reference = endsAt ?? startsAt;

  if (reference === null || reference === '') {
    return false;
  }

  const referenceTime = new Date(reference).getTime();

  if (Number.isNaN(referenceTime)) {
    return false;
  }

  return referenceTime > now.getTime();
};

const botRequired = (
  reason: RecallRecordingBotPolicyRequiredReason,
): RecallRecordingBotPolicyResult => ({ shouldRequestBot: true, reason });

const botNotRequired = (
  reason: RecallRecordingBotPolicyNotRequiredReason,
): RecallRecordingBotPolicyResult => ({ shouldRequestBot: false, reason });
