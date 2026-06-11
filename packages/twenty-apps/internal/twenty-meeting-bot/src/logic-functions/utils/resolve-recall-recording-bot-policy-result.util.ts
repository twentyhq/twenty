import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { type RecallRecordingBotPolicyInput } from 'src/logic-functions/types/recall-recording-bot-policy-input.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
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

  if (!isNonEmptyString(input.conferenceLinkUrl)) {
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

const isCalendarEventInFuture = ({
  startsAt,
  endsAt,
  now,
}: {
  startsAt: string | undefined;
  endsAt: string | undefined;
  now: Date;
}): boolean => {
  const reference = endsAt ?? startsAt;

  if (!isNonEmptyString(reference)) {
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
