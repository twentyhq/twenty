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

  const callRecordingId: unknown = Reflect.get(value, 'callRecordingId');
  const calendarEventId: unknown = Reflect.get(value, 'calendarEventId');
  const startsAt: unknown = Reflect.get(value, 'startsAt');
  const endsAt: unknown = Reflect.get(value, 'endsAt');

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
