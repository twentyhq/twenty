import { isNumber, isObject } from '@sniptt/guards';

import { extractPdlErrorMessage } from 'src/logic-functions/utils/extract-pdl-error-message';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { isDefined } from 'src/utils/is-defined';

const ASSUMED_SUCCESS_STATUS_WHEN_MISSING = 200;

export const parsePdlItem = <TData>({
  item,
  minLikelihood,
}: {
  item: unknown;
  minLikelihood?: number;
}): PdlEnrichResult<TData> => {
  if (!isObject(item)) {
    return {
      outcome: 'error',
      httpStatus: 0,
      message: 'People Data Labs returned a malformed response item.',
    };
  }

  const record = item as Record<string, unknown>;
  const status = isNumber(record.status)
    ? record.status
    : ASSUMED_SUCCESS_STATUS_WHEN_MISSING;

  if (status === 404) {
    return { outcome: 'not_found', httpStatus: 404 };
  }

  if (status < 200 || status >= 300) {
    return {
      outcome: 'error',
      httpStatus: status,
      message: extractPdlErrorMessage({ json: record, httpStatus: status }),
    };
  }

  if (!isObject(record.data)) {
    return { outcome: 'not_found', httpStatus: status };
  }

  const likelihood = isNumber(record.likelihood) ? record.likelihood : undefined;

  const isBelowRequestedThreshold =
    isDefined(minLikelihood) &&
    isDefined(likelihood) &&
    likelihood < minLikelihood;

  if (isBelowRequestedThreshold) {
    return { outcome: 'not_found', httpStatus: status };
  }

  return {
    outcome: 'matched',
    httpStatus: status,
    likelihood,
    data: record.data as TData,
  };
};
