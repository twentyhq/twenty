import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type CallRecordingMeetingCardInput } from 'src/logic-functions/types/call-recording-meeting-card-input.type';

const getOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

export const parseCallRecordingMeetingCardInput = (
  value: unknown,
): CallRecordingMeetingCardInput | undefined => {
  if (!isObject(value)) {
    return undefined;
  }

  const { callRecordingId, calendarEventId, startsAt, endsAt } =
    value as Record<string, unknown>;

  if (
    !isNonEmptyString(callRecordingId) ||
    !isNonEmptyString(calendarEventId)
  ) {
    return undefined;
  }

  return {
    callRecordingId,
    calendarEventId,
    startsAt: getOptionalString(startsAt),
    endsAt: getOptionalString(endsAt),
  };
};
