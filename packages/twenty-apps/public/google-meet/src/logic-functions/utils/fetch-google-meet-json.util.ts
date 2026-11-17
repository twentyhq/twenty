import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import {
  GOOGLE_MEET_REQUEST_MAX_ATTEMPTS,
  GOOGLE_MEET_REQUEST_RETRY_BASE_DELAY_MILLISECONDS,
  GOOGLE_MEET_REQUEST_RETRY_BUDGET_MILLISECONDS,
  GOOGLE_MEET_RETRYABLE_STATUSES,
} from 'src/logic-functions/constants/google-meet-api.constant';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { type GoogleRequestMethod } from 'src/logic-functions/types/google-request-method.type';
import { parseRetryAfterMilliseconds } from 'src/logic-functions/utils/parse-retry-after-milliseconds.util';
import { sleepForMilliseconds } from 'src/logic-functions/utils/sleep-for-milliseconds.util';

type GoogleMeetErrorBody = {
  error?: { message?: unknown; status?: unknown };
};

type GoogleMeetRequest = {
  accessToken: string;
  url: string;
  method?: GoogleRequestMethod;
  body?: object;
};

const fetchGoogleMeetResponseWithRetriesOrThrow = async ({
  accessToken,
  url,
  method,
  body,
  attempt,
  waitedMilliseconds,
}: GoogleMeetRequest & {
  attempt: number;
  waitedMilliseconds: number;
}): Promise<Response> => {
  const response = await fetch(url, {
    method,
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(isDefined(body) ? { 'Content-Type': 'application/json' } : {}),
    },
    body: isDefined(body) ? JSON.stringify(body) : undefined,
  });

  if (response.ok) {
    return response;
  }

  const retryDelayMilliseconds =
    parseRetryAfterMilliseconds({
      retryAfter: response.headers.get('Retry-After'),
      now: new Date(),
    }) ?? GOOGLE_MEET_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt;

  if (
    method !== 'POST' &&
    GOOGLE_MEET_RETRYABLE_STATUSES.has(response.status) &&
    attempt + 1 < GOOGLE_MEET_REQUEST_MAX_ATTEMPTS &&
    waitedMilliseconds + retryDelayMilliseconds <=
      GOOGLE_MEET_REQUEST_RETRY_BUDGET_MILLISECONDS
  ) {
    await sleepForMilliseconds(retryDelayMilliseconds);

    return fetchGoogleMeetResponseWithRetriesOrThrow({
      accessToken,
      url,
      method,
      body,
      attempt: attempt + 1,
      waitedMilliseconds: waitedMilliseconds + retryDelayMilliseconds,
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

  throw new GoogleMeetException({
    message: `Google Meet request failed (${response.status}${isNonEmptyString(googleStatus) ? ` ${googleStatus}` : ''}): ${message}`,
    code: 'REQUEST_FAILED',
    httpStatus: response.status,
    googleStatus,
  });
};

export const fetchGoogleMeetJson = async <TResponse>(
  request: GoogleMeetRequest,
): Promise<TResponse> => {
  const response = await fetchGoogleMeetResponseWithRetriesOrThrow({
    ...request,
    attempt: 0,
    waitedMilliseconds: 0,
  });

  const responseBody: TResponse = await response.json();

  return responseBody;
};
