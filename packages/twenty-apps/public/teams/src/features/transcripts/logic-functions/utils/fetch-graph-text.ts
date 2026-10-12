import { fetchGraphResponse } from 'src/features/transcripts/logic-functions/utils/fetch-graph-response';

export const fetchGraphText = async ({
  accessToken,
  url,
  accept,
}: {
  accessToken: string;
  url: string;
  accept: string;
}): Promise<string> => {
  const response = await fetchGraphResponse({ accessToken, url, accept });

  return response.text();
};
