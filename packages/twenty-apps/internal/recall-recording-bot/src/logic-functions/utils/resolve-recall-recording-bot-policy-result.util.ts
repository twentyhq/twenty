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

  if (input.recallRecordingBotPreference === 'OFF') {
    return botNotRequired('PREFERENCE_OFF');
  }

  if (input.recallRecordingBotPreference === 'ON') {
    if (!hasConferenceLink(input.conferenceLinkUrl)) {
      return botNotRequired('PREFERENCE_ON_MISSING_CONFERENCE_LINK');
    }

    if (
      !isCalendarEventInFuture({
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        now,
      })
    ) {
      return botNotRequired('PREFERENCE_ON_EVENT_NOT_UPCOMING');
    }

    return botRequired('PREFERENCE_ON');
  }

  if (!hasConferenceLink(input.conferenceLinkUrl)) {
    return botNotRequired('AUTO_MISSING_CONFERENCE_LINK');
  }

  if (
    !isCalendarEventInFuture({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      now,
    })
  ) {
    return botNotRequired('AUTO_EVENT_NOT_UPCOMING');
  }

  if (!input.hasExternalParticipant) {
    return botNotRequired('AUTO_NO_EXTERNAL_PARTICIPANT');
  }

  return botRequired('AUTO_POLICY_MATCHED');
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
