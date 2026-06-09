import { isObject } from '@sniptt/guards';

import { extractPdlErrorMessage } from 'src/logic-functions/utils/extract-pdl-error-message';
import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';
import { parsePdlItem } from 'src/logic-functions/utils/parse-pdl-item';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

const PDL_BASE_URL = 'https://api.peopledatalabs.com/v5';

export const postPdlBulkEnrich = async <TData>(
  path: string,
  requests: Record<string, unknown>[],
): Promise<PdlEnrichResult<TData>[]> => {
  if (requests.length === 0) {
    return [];
  }

  const apiKey = getPdlApiKey();

  const failAll = (
    message: string,
    httpStatus: number,
  ): PdlEnrichResult<TData>[] =>
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

    return failAll(`PDL request failed: ${message}`, 0);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return failAll(
      `PDL returned a non-JSON response (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (!response.ok) {
    const message = isObject(json)
      ? extractPdlErrorMessage(json as Record<string, unknown>, response.status)
      : `PDL request failed (HTTP ${response.status}).`;

    return failAll(message, response.status);
  }

  const items = Array.isArray(json)
    ? json
    : isObject(json) && Array.isArray((json as Record<string, unknown>).responses)
      ? ((json as Record<string, unknown>).responses as unknown[])
      : [];

  return requests.map((_params, index) => parsePdlItem<TData>(items[index]));
};
