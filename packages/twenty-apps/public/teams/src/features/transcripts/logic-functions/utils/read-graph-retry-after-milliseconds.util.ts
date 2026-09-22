import { GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS } from 'src/features/transcripts/constants/teams.constant';

export const readGraphRetryAfterMilliseconds = ({
  response,
  attempt,
}: {
  response: Response;
  attempt: number;
}): number => {
  const retryAfterSeconds = Number(response.headers.get('Retry-After'));

  return retryAfterSeconds > 0
    ? retryAfterSeconds * 1_000
    : GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt;
};
