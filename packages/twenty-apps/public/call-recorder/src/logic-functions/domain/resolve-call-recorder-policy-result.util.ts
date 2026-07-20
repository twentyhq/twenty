import { isUndefined } from '@sniptt/guards';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { computeUpcomingCalendarEventHorizonEnd } from 'src/logic-functions/domain/compute-upcoming-calendar-event-horizon-end.util';
import { isSupportedMeetingPlatformUrl } from 'src/logic-functions/domain/is-supported-meeting-platform-url.util';
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

  if (!isSupportedMeetingPlatformUrl(input.conferenceLinkUrl)) {
    return botNotRequired('UNSUPPORTED_MEETING_PLATFORM');
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

  if (
    !isCalendarEventWithinSchedulingHorizon({
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      now,
    })
  ) {
    return botNotRequired('EVENT_BEYOND_SCHEDULING_HORIZON');
  }

  return botRequired('RECORDING_ENABLED');
};

type CalendarEventWindowInput = {
  startsAt: string | undefined;
  endsAt: string | undefined;
  now: Date;
};

const parseTimestampMs = (
  timestamp: string | undefined,
): number | undefined => {
  if (!isNonEmptyString(timestamp)) {
    return undefined;
  }

  const timestampMs = new Date(timestamp).getTime();

  return Number.isNaN(timestampMs) ? undefined : timestampMs;
};

const isCalendarEventInFuture = ({
  startsAt,
  endsAt,
  now,
}: CalendarEventWindowInput): boolean => {
  const referenceMs = parseTimestampMs(endsAt) ?? parseTimestampMs(startsAt);

  if (isUndefined(referenceMs)) {
    return false;
  }

  return referenceMs > now.getTime();
};

// The bot joins at the meeting start, so the horizon is measured from startsAt
// (endsAt only as a fallback), unlike the not-past check which measures from the end.
const isCalendarEventWithinSchedulingHorizon = ({
  startsAt,
  endsAt,
  now,
}: CalendarEventWindowInput): boolean => {
  const referenceMs = parseTimestampMs(startsAt) ?? parseTimestampMs(endsAt);

  if (isUndefined(referenceMs)) {
    return false;
  }

  return referenceMs <= computeUpcomingCalendarEventHorizonEnd(now).getTime();
};

const botRequired = (
  reason: CallRecorderPolicyRequiredReason,
): CallRecorderPolicyResult => ({ shouldRequestBot: true, reason });

const botNotRequired = (
  reason: CallRecorderPolicyNotRequiredReason,
): CallRecorderPolicyResult => ({ shouldRequestBot: false, reason });
