import {
  GRAPH_REQUEST_MAX_ATTEMPTS,
  GRAPH_RETRYABLE_STATUSES,
} from 'src/features/transcripts/constants/teams.constant';
import { buildGraphRequestError } from 'src/features/transcripts/logic-functions/utils/build-graph-request-error.util';
import { readGraphRetryAfterMilliseconds } from 'src/features/transcripts/logic-functions/utils/read-graph-retry-after-milliseconds.util';
import { sleepForMilliseconds } from 'src/features/transcripts/logic-functions/utils/sleep-for-milliseconds.util';

export const fetchGraphWithRetry = async ({
  accessToken,
  resolvedUrl,
  attempt,
}: {
  accessToken: string;
  resolvedUrl: string;
  attempt: number;
}): Promise<Response> => {
  const response = await fetch(resolvedUrl, {
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (response.ok) {
    return response;
  }

  const canRetry =
    GRAPH_RETRYABLE_STATUSES.has(response.status) &&
    attempt + 1 < GRAPH_REQUEST_MAX_ATTEMPTS;

  if (!canRetry) {
    throw await buildGraphRequestError(response);
  }

  await sleepForMilliseconds(
    readGraphRetryAfterMilliseconds({ response, attempt }),
  );

  return fetchGraphWithRetry({
    accessToken,
    resolvedUrl,
    attempt: attempt + 1,
  });
};
