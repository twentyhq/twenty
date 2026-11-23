import { isNonEmptyString } from '@sniptt/guards';

import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';

export const buildGoogleApiUrlOrThrow = ({
  baseUrl,
  path,
  queryParameters,
}: {
  baseUrl: string;
  path: string;
  queryParameters: Record<string, string | undefined>;
}): string => {
  const url = new URL(`${baseUrl}/${path}`);

  if (!url.href.startsWith(`${baseUrl}/`)) {
    throw new GoogleMeetException({
      message: `Google resource paths must stay under ${baseUrl}`,
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
