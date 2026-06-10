import { isNumber, isObject } from '@sniptt/guards';

import { extractPdlErrorMessage } from 'src/logic-functions/utils/extract-pdl-error-message';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { isDefined } from 'src/utils/is-defined';

const ASSUMED_SUCCESS_STATUS_WHEN_MISSING = 200;

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

  if (!isObject(responseItem.data)) {
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
    data: responseItem.data as TData,
  };
};
