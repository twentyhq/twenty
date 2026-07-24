import { isNumber, isObject } from '@sniptt/guards';

import { extractPdlErrorMessage } from 'src/logic-functions/utils/extract-pdl-error-message';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { isDefined } from 'src/utils/is-defined';

const ASSUMED_SUCCESS_STATUS_WHEN_MISSING = 200;

const ENVELOPE_FIELD_NAMES = new Set(['status', 'likelihood']);

const extractMatchedData = (
  responseItem: Record<string, unknown>,
): Record<string, unknown> => {
  if (isObject(responseItem.data)) {
    return responseItem.data as Record<string, unknown>;
  }

  return Object.fromEntries(
    Object.entries(responseItem).filter(
      ([fieldName]) => !ENVELOPE_FIELD_NAMES.has(fieldName),
    ),
  );
};

export const parsePdlItem = <TData>({
  item,
  requestedMinLikelihood,
}: {
  item: unknown;
  requestedMinLikelihood?: number;
}): PdlEnrichResult<TData> => {
  if (!isObject(item)) {
    return {
      outcome: 'error',
      httpStatus: 0,
      message: 'People Data Labs returned a malformed response item.',
    };
  }

  const responseItem = item as Record<string, unknown>;
  const httpStatus = isNumber(responseItem.status)
    ? responseItem.status
    : ASSUMED_SUCCESS_STATUS_WHEN_MISSING;

  if (httpStatus === 404) {
    return { outcome: 'not_found', httpStatus: 404 };
  }

  if (httpStatus < 200 || httpStatus >= 300) {
    return {
      outcome: 'error',
      httpStatus,
      message: extractPdlErrorMessage({ json: responseItem, httpStatus }),
    };
  }

  const matchedData = extractMatchedData(responseItem);

  if (Object.keys(matchedData).length === 0) {
    return { outcome: 'not_found', httpStatus };
  }

  const matchLikelihood = isNumber(responseItem.likelihood)
    ? responseItem.likelihood
    : undefined;

  const isMatchBelowRequestedThreshold =
    isDefined(requestedMinLikelihood) &&
    isDefined(matchLikelihood) &&
    matchLikelihood < requestedMinLikelihood;

  if (isMatchBelowRequestedThreshold) {
    return { outcome: 'not_found', httpStatus };
  }

  return {
    outcome: 'matched',
    httpStatus,
    likelihood: matchLikelihood,
    data: matchedData as TData,
  };
};
