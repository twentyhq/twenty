import { isNonEmptyString } from '@sniptt/guards';

import { GOOGLE_MEET_API_BASE_URL } from 'src/logic-functions/constants/google-meet-api.constant';

export const buildGoogleMeetUrl = ({
  path,
  queryParameters,
}: {
  path: string;
  queryParameters: Record<string, string | undefined>;
}): string => {
  const url = new URL(`${GOOGLE_MEET_API_BASE_URL}/${path}`);

  for (const [name, value] of Object.entries(queryParameters)) {
    if (isNonEmptyString(value)) {
      url.searchParams.set(name, value);
    }
  }

  return url.toString();
};
