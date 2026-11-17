import { isNonEmptyString } from '@sniptt/guards';

import {
  GOOGLE_MEET_REQUEST_MAX_ATTEMPTS,
  GOOGLE_MEET_REQUEST_RETRY_BASE_DELAY_MILLISECONDS,
  GOOGLE_MEET_RETRYABLE_STATUSES,
} from 'src/logic-functions/constants/google-meet-api.constant';
import { GoogleMeetRequestError } from 'src/logic-functions/types/google-meet-request-error.type';
import { sleepForMilliseconds } from 'src/logic-functions/utils/sleep-for-milliseconds.util';

type GoogleMeetErrorBody = {
  error?: { message?: unknown; status?: unknown };
};

type GoogleMeetRequest = {
  accessToken: string;
  url: string;
};

const fetchGoogleMeetResponseWithRetries = async ({
  accessToken,
  url,
  attempt,
}: GoogleMeetRequest & { attempt: number }): Promise<Response> => {
  const response = await fetch(url, {
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (response.ok) {
    return response;
  }

  if (
    GOOGLE_MEET_RETRYABLE_STATUSES.has(response.status) &&
    attempt + 1 < GOOGLE_MEET_REQUEST_MAX_ATTEMPTS
  ) {
    const retryAfterSeconds = Number(response.headers.get('Retry-After'));

    await sleepForMilliseconds(
      retryAfterSeconds > 0
        ? retryAfterSeconds * 1_000
        : GOOGLE_MEET_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt,
    );

    return fetchGoogleMeetResponseWithRetries({
      accessToken,
      url,
      attempt: attempt + 1,
    });
  }

  const errorBody: GoogleMeetErrorBody = await response
    .json()
    .catch(() => ({}));
  const googleStatus = isNonEmptyString(errorBody.error?.status)
    ? errorBody.error.status
    : undefined;
  const message = isNonEmptyString(errorBody.error?.message)
    ? errorBody.error.message
    : response.statusText;

  throw new GoogleMeetRequestError({
    message: `Google Meet request failed (${response.status}${isNonEmptyString(googleStatus) ? ` ${googleStatus}` : ''}): ${message}`,
    httpStatus: response.status,
    googleStatus,
  });
};

export const fetchGoogleMeetJson = async <TResponse>({
  accessToken,
  url,
}: GoogleMeetRequest): Promise<TResponse> => {
  const response = await fetchGoogleMeetResponseWithRetries({
    accessToken,
    url,
    attempt: 0,
  });

  const responseBody: TResponse = await response.json();

  return responseBody;
};
