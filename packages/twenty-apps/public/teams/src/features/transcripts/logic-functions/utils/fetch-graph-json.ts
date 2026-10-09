import { type GraphRequestMethod } from 'src/features/transcripts/logic-functions/types/graph-request-method.type';
import { fetchGraphResponse } from 'src/features/transcripts/logic-functions/utils/fetch-graph-response';

export const fetchGraphJson = async <TResponse>({
  accessToken,
  url,
  method,
  body,
}: {
  accessToken: string;
  url: string;
  method?: GraphRequestMethod;
  body?: object;
}): Promise<TResponse> => {
  const response = await fetchGraphResponse({
    accessToken,
    url,
    accept: 'application/json',
    method,
    body,
  });

  const responseBody: TResponse = await response.json();

  return responseBody;
};
