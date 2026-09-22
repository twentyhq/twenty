import { fetchGraphWithRetry } from 'src/logic-functions/utils/fetch-graph-with-retry.util';
import { resolveGraphUrl } from 'src/logic-functions/utils/resolve-graph-url.util';

export const graphFetchJson = async <TResponse>({
  accessToken,
  url,
}: {
  accessToken: string;
  url: string;
}): Promise<TResponse> => {
  const response = await fetchGraphWithRetry({
    accessToken,
    resolvedUrl: resolveGraphUrl(url),
    attempt: 0,
  });

  const body: TResponse = await response.json();

  return body;
};
