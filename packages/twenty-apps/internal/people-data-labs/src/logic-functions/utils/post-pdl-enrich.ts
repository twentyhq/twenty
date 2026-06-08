import { isNumber, isObject } from '@sniptt/guards';

import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

const PDL_BASE_URL = 'https://api.peopledatalabs.com/v5';

const extractErrorMessage = (
  json: Record<string, unknown>,
  httpStatus: number,
): string => {
  const errorField = json.error;

  if (isObject(errorField) && 'message' in errorField) {
    return String((errorField as { message: unknown }).message);
  }

  return `PDL request failed (HTTP ${httpStatus}).`;
};

export const postPdlEnrich = async <TData>(
  path: string,
  body: Record<string, unknown>,
): Promise<PdlEnrichResult<TData>> => {
  const apiKey = getPdlApiKey();

  let response: Response;
  try {
    response = await fetch(`${PDL_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return { outcome: 'error', httpStatus: 0, message: `PDL request failed: ${message}` };
  }

  if (response.status === 404) {
    return { outcome: 'not_found', httpStatus: 404 };
  }

  let json: Record<string, unknown>;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    return {
      outcome: 'error',
      httpStatus: response.status,
      message: `PDL returned a non-JSON response (HTTP ${response.status}).`,
    };
  }

  if (!response.ok) {
    return {
      outcome: 'error',
      httpStatus: response.status,
      message: extractErrorMessage(json, response.status),
    };
  }

  const likelihood = isNumber(json.likelihood) ? json.likelihood : undefined;

  return {
    outcome: 'matched',
    httpStatus: response.status,
    likelihood,
    data: (json.data ?? json) as TData,
  };
};
