import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { type CallRecorderPolicyInput } from 'src/logic-functions/types/call-recorder-policy-input.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { type CallRecorderPolicyNotRequiredReason } from 'src/logic-functions/types/call-recorder-policy-not-required-reason.type';
import { type CallRecorderPolicyRequiredReason } from 'src/logic-functions/types/call-recorder-policy-required-reason.type';
import { type CallRecorderPolicyResult } from 'src/logic-functions/types/call-recorder-policy-result.type';

type ResolveCallRecorderPolicyResultArgs = {
  input: CallRecorderPolicyInput;
  now: Date;
};

export const resolveCallRecorderPolicyResult = ({
  input,
  now,
}: ResolveCallRecorderPolicyResultArgs): CallRecorderPolicyResult => {
  if (input.isCanceled) {
    return botNotRequired('EVENT_CANCELED');
  }

  if (input.callRecorderPreference === CallRecorderPreference.OFF) {
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
  reason: CallRecorderPolicyRequiredReason,
): CallRecorderPolicyResult => ({ shouldRequestBot: true, reason });

const botNotRequired = (
  reason: CallRecorderPolicyNotRequiredReason,
): CallRecorderPolicyResult => ({ shouldRequestBot: false, reason });
