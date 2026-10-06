import { fetchGraphResponse } from 'src/features/transcripts/logic-functions/utils/fetch-graph-response';

export const fetchGraphJson = async <TResponse>({
  accessToken,
  url,
}: {
  accessToken: string;
  url: string;
}): Promise<TResponse> => {
  const response = await fetchGraphResponse({
    accessToken,
    url,
    accept: 'application/json',
  });

  const body: TResponse = await response.json();

  return body;
};
