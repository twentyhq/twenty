import { isNumber, isObject } from '@sniptt/guards';

import {
  PEOPLE_DATA_LABS_BASE_URL,
  type PeopleDataLabsEnrichResult,
  extractPeopleDataLabsErrorMessage,
  parsePeopleDataLabsResponseItem,
} from 'twenty-shared/people-data-labs';
import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';
export const postPdlBulkEnrich = async <TData>({
  path,
  requests,
}: {
  path: string;
  requests: Record<string, unknown>[];
}): Promise<PeopleDataLabsEnrichResult<TData>[]> => {
  if (requests.length === 0) {
    return [];
  }

  const apiKey = getPdlApiKey();

  const failAll = ({
    message,
    httpStatus,
  }: {
    message: string;
    httpStatus: number;
  }): PeopleDataLabsEnrichResult<TData>[] =>
    requests.map(() => ({ outcome: 'error', httpStatus, message }));

  let response: Response;
  try {
    response = await fetch(`${PEOPLE_DATA_LABS_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({ requests: requests.map((params) => ({ params })) }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return failAll({ message: `PDL request failed: ${message}`, httpStatus: 0 });
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return failAll({
      message: `PDL returned a non-JSON response (HTTP ${response.status}).`,
      httpStatus: response.status,
    });
  }

  if (!response.ok) {
    const message = isObject(json)
      ? extractPeopleDataLabsErrorMessage({
          json: json as Record<string, unknown>,
          httpStatus: response.status,
        })
      : `PDL request failed (HTTP ${response.status}).`;

    return failAll({ message, httpStatus: response.status });
  }

  const responseItems = Array.isArray(json)
    ? json
    : isObject(json) && Array.isArray((json as Record<string, unknown>).responses)
      ? ((json as Record<string, unknown>).responses as unknown[])
      : [];

  if (responseItems.length !== requests.length) {
    return failAll({
      message: `People Data Labs returned ${responseItems.length} results for ${requests.length} requests (HTTP ${response.status}).`,
      httpStatus: response.status,
    });
  }

  return requests.map((requestParams, index) =>
    parsePeopleDataLabsResponseItem<TData>({
      item: responseItems[index],
      requestedMinLikelihood: isNumber(requestParams.min_likelihood)
        ? requestParams.min_likelihood
        : undefined,
    }),
  );
};
