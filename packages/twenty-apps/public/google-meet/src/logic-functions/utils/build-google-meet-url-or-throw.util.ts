import { isNonEmptyString } from '@sniptt/guards';

import { GOOGLE_MEET_API_BASE_URL } from 'src/logic-functions/constants/google-meet-api.constant';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';

export const buildGoogleMeetUrlOrThrow = ({
  path,
  queryParameters,
}: {
  path: string;
  queryParameters: Record<string, string | undefined>;
}): string => {
  const url = new URL(`${GOOGLE_MEET_API_BASE_URL}/${path}`);

  if (!url.href.startsWith(`${GOOGLE_MEET_API_BASE_URL}/`)) {
    throw new GoogleMeetException({
      message: 'Google Meet resource paths must stay under the Meet API',
      code: 'INVALID_RESOURCE_PATH',
    });
  }

  for (const [name, value] of Object.entries(queryParameters)) {
    if (isNonEmptyString(value)) {
      url.searchParams.set(name, value);
    }
  }

  return url.toString();
};
