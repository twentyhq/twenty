import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type GoogleMeetEventData } from 'src/logic-functions/types/google-meet-event-data.type';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';

const decodeGoogleMeetEventData = (
  encodedData: string,
): GoogleMeetEventData | null => {
  try {
    return JSON.parse(Buffer.from(encodedData, 'base64').toString('utf8'));
  } catch (error) {
    throw new GoogleMeetException({
      message: `The Google Meet event data is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      code: 'EVENT_DATA_UNREADABLE',
    });
  }
};

export const parseGoogleMeetEventDataOrThrow = (
  encodedData: string | undefined,
): GoogleMeetEventData => {
  if (!isNonEmptyString(encodedData)) {
    return {};
  }

  const eventData = decodeGoogleMeetEventData(encodedData);

  if (!isObject(eventData)) {
    throw new GoogleMeetException({
      message: 'The Google Meet event data is not an object',
      code: 'EVENT_DATA_UNREADABLE',
    });
  }

  return eventData;
};
