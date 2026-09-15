import { isNumber, isObject } from '@sniptt/guards';

import { PDL_BASE_URL } from 'src/constants/pdl-base-url';
import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';
import { parsePdlItem } from 'src/logic-functions/utils/parse-pdl-item';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

export const postPdlSingleEnrich = async <TData>({
  path,
  params,
}: {
  path: string;
  params: Record<string, unknown>;
}): Promise<PdlEnrichResult<TData>> => {
  const apiKey = getPdlApiKey();

  let response: Response;
  try {
    response = await fetch(`${PDL_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(params),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      outcome: 'error',
      httpStatus: 0,
      message: `PDL request failed: ${message}`,
    };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return {
      outcome: 'error',
      httpStatus: response.status,
      message: `PDL returned a non-JSON response (HTTP ${response.status}).`,
    };
  }

  const responseItem = isObject(json) ? (json as Record<string, unknown>) : {};
  const responseItemWithStatus = isNumber(responseItem.status)
    ? responseItem
    : { ...responseItem, status: response.status };

  return parsePdlItem<TData>({
    item: responseItemWithStatus,
    requestedMinLikelihood: isNumber(params.min_likelihood)
      ? params.min_likelihood
      : undefined,
  });
};
