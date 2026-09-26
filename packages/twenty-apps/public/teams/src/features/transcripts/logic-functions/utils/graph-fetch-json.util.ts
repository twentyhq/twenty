import { fetchGraphWithRetry } from 'src/features/transcripts/logic-functions/utils/fetch-graph-with-retry.util';
import { resolveGraphUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-graph-url-or-throw.util';

export const graphFetchJson = async <TResponse>({
  accessToken,
  url,
}: {
  accessToken: string;
  url: string;
}): Promise<TResponse> => {
  const response = await fetchGraphWithRetry({
    accessToken,
    resolvedUrl: resolveGraphUrlOrThrow(url),
    attempt: 0,
  });

  const body: TResponse = await response.json();

  return body;
};
