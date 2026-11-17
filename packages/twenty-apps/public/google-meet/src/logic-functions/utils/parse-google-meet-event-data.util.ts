import { isNonEmptyString } from '@sniptt/guards';

import { type GoogleMeetEventData } from 'src/logic-functions/types/google-meet-event-data.type';

export const parseGoogleMeetEventData = (
  encodedData: string | undefined,
): GoogleMeetEventData => {
  if (!isNonEmptyString(encodedData)) {
    return {};
  }

  try {
    const eventData: GoogleMeetEventData | null = JSON.parse(
      Buffer.from(encodedData, 'base64').toString('utf8'),
    );

    return eventData ?? {};
  } catch {
    return {};
  }
};
