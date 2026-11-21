import axios from 'axios';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRAPH_API_BASE_URL,
  GRAPH_API_VERSION,
} from 'src/constants/graph-api.constant';
import { GraphApiError } from 'src/logic-functions/data/graph-api-error';

type GraphApiErrorResponse = {
  error?: { message: string; code: number; error_user_msg?: string };
};

export const graphApiRequest = async <TResponse>({
  accessToken,
  method,
  path,
  query,
  data,
}: {
  accessToken: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  query?: Record<string, string>;
  data?: unknown;
}): Promise<TResponse> => {
  try {
    const response = await axios.request<TResponse>({
      url: `${GRAPH_API_BASE_URL}/${GRAPH_API_VERSION}/${path}`,
      method,
      params: query,
      data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  } catch (error) {
    const graphError = axios.isAxiosError<GraphApiErrorResponse>(error)
      ? error.response?.data?.error
      : undefined;

    if (!isDefined(graphError)) {
      throw error;
    }

    throw new GraphApiError(
      `Messenger API error ${graphError.code} on ${method} /${path}: ${graphError.error_user_msg ?? graphError.message}`,
      graphError.code,
    );
  }
};
