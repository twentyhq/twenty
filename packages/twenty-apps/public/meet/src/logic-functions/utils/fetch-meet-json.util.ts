import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import {
  MEET_REQUEST_MAX_ATTEMPTS,
  MEET_REQUEST_RETRY_BASE_DELAY_MILLISECONDS,
  MEET_REQUEST_RETRY_BUDGET_MILLISECONDS,
  MEET_RETRYABLE_STATUSES,
} from 'src/logic-functions/constants/meet-api.constant';
import { MeetException } from 'src/logic-functions/types/meet-exception.type';
import { type GoogleRequestMethod } from 'src/logic-functions/types/google-request-method.type';
import { parseRetryAfterMilliseconds } from 'src/logic-functions/utils/parse-retry-after-milliseconds.util';
import { sleepForMilliseconds } from 'src/logic-functions/utils/sleep-for-milliseconds.util';

type MeetErrorBody = {
  error?: { message?: unknown; status?: unknown };
};

type MeetRequest = {
  accessToken: string;
  url: string;
  method?: GoogleRequestMethod;
  body?: object;
};

const fetchMeetResponseWithRetriesOrThrow = async ({
  accessToken,
  url,
  method,
  body,
  attempt,
  waitedMilliseconds,
}: MeetRequest & {
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
    }) ?? MEET_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt;

  if (
    method !== 'POST' &&
    MEET_RETRYABLE_STATUSES.has(response.status) &&
    attempt + 1 < MEET_REQUEST_MAX_ATTEMPTS &&
    waitedMilliseconds + retryDelayMilliseconds <=
      MEET_REQUEST_RETRY_BUDGET_MILLISECONDS
  ) {
    await sleepForMilliseconds(retryDelayMilliseconds);

    return fetchMeetResponseWithRetriesOrThrow({
      accessToken,
      url,
      method,
      body,
      attempt: attempt + 1,
      waitedMilliseconds: waitedMilliseconds + retryDelayMilliseconds,
    });
  }

  const errorBody: MeetErrorBody = await response
    .json()
    .catch(() => ({}));
  const googleStatus = isNonEmptyString(errorBody.error?.status)
    ? errorBody.error.status
    : undefined;
  const message = isNonEmptyString(errorBody.error?.message)
    ? errorBody.error.message
    : response.statusText;

  throw new MeetException({
    message: `Google Meet request failed (${response.status}${isNonEmptyString(googleStatus) ? ` ${googleStatus}` : ''}): ${message}`,
    code: 'REQUEST_FAILED',
    httpStatus: response.status,
    googleStatus,
  });
};

export const fetchMeetJson = async <TResponse>(
  request: MeetRequest,
): Promise<TResponse> => {
  const response = await fetchMeetResponseWithRetriesOrThrow({
    ...request,
    attempt: 0,
    waitedMilliseconds: 0,
  });

  const responseBody: TResponse = await response.json();

  return responseBody;
};
