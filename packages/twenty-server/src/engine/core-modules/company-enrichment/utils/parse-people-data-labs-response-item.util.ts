import { isNumber, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type PeopleDataLabsEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-enrich-result.type';
import { extractPeopleDataLabsErrorMessage } from 'src/engine/core-modules/company-enrichment/utils/extract-people-data-labs-error-message.util';

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

export const parsePeopleDataLabsResponseItem = <TData>({
  item,
  requestedMinLikelihood,
}: {
  item: unknown;
  requestedMinLikelihood?: number;
}): PeopleDataLabsEnrichResult<TData> => {
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
      message: extractPeopleDataLabsErrorMessage({
        json: responseItem,
        httpStatus,
      }),
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
