import { isNumber, isObject } from '@sniptt/guards';

import {
  PEOPLE_DATA_LABS_BASE_URL,
  type PeopleDataLabsEnrichResult,
  parsePeopleDataLabsResponseItem,
} from 'twenty-shared/people-data-labs';
import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';
export const postPdlSingleEnrich = async <TData>({
  path,
  params,
}: {
  path: string;
  params: Record<string, unknown>;
}): Promise<PeopleDataLabsEnrichResult<TData>> => {
  const apiKey = getPdlApiKey();

  let response: Response;
  try {
    response = await fetch(`${PEOPLE_DATA_LABS_BASE_URL}${path}`, {
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

  return parsePeopleDataLabsResponseItem<TData>({
    item: responseItemWithStatus,
    requestedMinLikelihood: isNumber(params.min_likelihood)
      ? params.min_likelihood
      : undefined,
  });
};
