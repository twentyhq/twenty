import { MeetingBotPreference } from 'src/constants/meeting-bot-preference';
import { type MeetingBotPolicyInput } from 'src/logic-functions/types/meeting-bot-policy-input.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { type MeetingBotPolicyNotRequiredReason } from 'src/logic-functions/types/meeting-bot-policy-not-required-reason.type';
import { type MeetingBotPolicyRequiredReason } from 'src/logic-functions/types/meeting-bot-policy-required-reason.type';
import { type MeetingBotPolicyResult } from 'src/logic-functions/types/meeting-bot-policy-result.type';

type ResolveMeetingBotPolicyResultArgs = {
  input: MeetingBotPolicyInput;
  now: Date;
};

export const resolveMeetingBotPolicyResult = ({
  input,
  now,
}: ResolveMeetingBotPolicyResultArgs): MeetingBotPolicyResult => {
  if (input.isCanceled) {
    return botNotRequired('EVENT_CANCELED');
  }

  if (input.meetingBotPreference === MeetingBotPreference.OFF) {
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

  return botRequired('RECORDING_ENABLED');
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
  reason: MeetingBotPolicyRequiredReason,
): MeetingBotPolicyResult => ({ shouldRequestBot: true, reason });

const botNotRequired = (
  reason: MeetingBotPolicyNotRequiredReason,
): MeetingBotPolicyResult => ({ shouldRequestBot: false, reason });
