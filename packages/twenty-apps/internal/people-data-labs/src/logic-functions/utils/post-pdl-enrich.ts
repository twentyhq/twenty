import { isNumber, isObject } from '@sniptt/guards';

import { extractPdlErrorMessage } from 'src/logic-functions/utils/extract-pdl-error-message';
import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';
import { parsePdlItem } from 'src/logic-functions/utils/parse-pdl-item';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

const PDL_BASE_URL = 'https://api.peopledatalabs.com/v5';

export const postPdlBulkEnrich = async <TData>({
  path,
  requests,
}: {
  path: string;
  requests: Record<string, unknown>[];
}): Promise<PdlEnrichResult<TData>[]> => {
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
  }): PdlEnrichResult<TData>[] =>
    requests.map(() => ({ outcome: 'error', httpStatus, message }));

  let response: Response;
  try {
    response = await fetch(`${PDL_BASE_URL}${path}`, {
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
      ? extractPdlErrorMessage({
          json: json as Record<string, unknown>,
          httpStatus: response.status,
        })
      : `PDL request failed (HTTP ${response.status}).`;

    return failAll({ message, httpStatus: response.status });
  }

  const items = Array.isArray(json)
    ? json
    : isObject(json) && Array.isArray((json as Record<string, unknown>).responses)
      ? ((json as Record<string, unknown>).responses as unknown[])
      : [];

  if (items.length !== requests.length) {
    return failAll({
      message: `People Data Labs returned ${items.length} results for ${requests.length} requests (HTTP ${response.status}).`,
      httpStatus: response.status,
    });
  }

  return requests.map((params, index) =>
    parsePdlItem<TData>({
      item: items[index],
      minLikelihood: isNumber(params.min_likelihood)
        ? params.min_likelihood
        : undefined,
    }),
  );
};
