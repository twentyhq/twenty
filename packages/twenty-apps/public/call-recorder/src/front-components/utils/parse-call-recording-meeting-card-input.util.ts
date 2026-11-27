import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type CallRecordingMeetingCardInput } from 'src/logic-functions/types/call-recording-meeting-card-input.type';

const readField = (value: object, fieldName: string): unknown =>
  Reflect.get(value, fieldName);

const getOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

export const parseCallRecordingMeetingCardInput = (
  value: unknown,
): CallRecordingMeetingCardInput | undefined => {
  if (!isObject(value)) {
    return undefined;
  }

  const callRecordingId = readField(value, 'callRecordingId');
  const calendarEventId = readField(value, 'calendarEventId');

  if (
    !isNonEmptyString(callRecordingId) ||
    !isNonEmptyString(calendarEventId)
  ) {
    return undefined;
  }

  return {
    callRecordingId,
    calendarEventId,
    startsAt: getOptionalString(readField(value, 'startsAt')),
    endsAt: getOptionalString(readField(value, 'endsAt')),
  };
};
