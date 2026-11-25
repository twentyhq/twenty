import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type MeetEventData } from 'src/logic-functions/types/meet-event-data.type';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';

const decodeMeetEventData = (
  encodedData: string,
): MeetEventData | null => {
  try {
    return JSON.parse(Buffer.from(encodedData, 'base64').toString('utf8'));
  } catch (error) {
    throw new MeetException({
      message: `The Google Meet event data is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      code: 'EVENT_DATA_UNREADABLE',
    });
  }
};

export const parseMeetEventDataOrThrow = (
  encodedData: string | undefined,
): MeetEventData => {
  if (!isNonEmptyString(encodedData)) {
    return {};
  }

  const eventData = decodeMeetEventData(encodedData);

  if (!isObject(eventData)) {
    throw new MeetException({
      message: 'The Google Meet event data is not an object',
      code: 'EVENT_DATA_UNREADABLE',
    });
  }

  return eventData;
};
